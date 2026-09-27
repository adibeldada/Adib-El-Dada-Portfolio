// the 3D trail map behind the whole page. it's built from simple parts:
//   terrain.ts   the ground: hills, the cliff, the water, the cut-away sides
//   trail.ts     the path and its stops
//   scenery.ts   trees and city lights
//   camera.ts    where the camera goes as you scroll
//   palette.ts   colors for light and dark mode
//   quality.ts   keeping it smooth on slower computers
//   world.ts     the little things around the map (tiny me, the server rack...): add new ones there
// this file puts them in one scene and draws a new frame whenever something moves.

import * as THREE from 'three';
import { makeGround, groundGeometry, makeWater, makeSides, makeShadow, WIDTH, DEPTH } from './terrain';
import { makeTrail, makePins, STOPS } from './trail';
import { makeTrees, makeCityLights } from './scenery';
import { frameShot, blendShots, type Shot } from './camera';
import { colors, levels, type ColorKey, type LevelKey } from './palette';
import { hasGraphicsCard, pixelRatioFor, AdaptiveQuality, type Tier } from './quality';
import { WORLD } from './world';
import { onGround } from './kit';
import { seeded } from './noise';
import { trailProgress, stepNames } from '../scripts/trail-progress';

const isDark = () => document.documentElement.dataset.theme === 'dark';
const approach = (value: number, target: number, step: number) =>
	value < target ? Math.min(target, value + step) : Math.max(target, value - step);

export function startMap(canvas: HTMLCanvasElement, labels: HTMLElement) {
	// without a graphics card (like chrome with graphics acceleration off) the browser draws the 3D in
	// software on the processor, so the map starts on a cheaper tier. either way it adapts as it goes
	const software = !hasGraphicsCard();
	const dpr = window.devicePixelRatio || 1;
	let renderer: THREE.WebGLRenderer;
	try {
		// antialiasing smooths jagged edges in hardware. on sharp 2x screens the pixels already hide them
		renderer = new THREE.WebGLRenderer({ canvas, antialias: !software && dpr < 2, alpha: true });
	} catch {
		// this browser can't do 3D at all (very rare now), so the page shows its plain version
		document.documentElement.classList.add('no-map');
		return;
	}

	const phone = matchMedia('(max-width: 820px)').matches;
	const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
	// the quality tier (see quality.ts): it trades resolution, scenery and ground detail, never the motion
	const adaptive = new AdaptiveQuality(software ? 2 : 0, (tier) => applyTier(tier));
	renderer.setPixelRatio(pixelRatioFor(adaptive.tier));

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 200);

	// lights for the pins and trees (the ground does its own lighting in its shader)
	const hemi = new THREE.HemisphereLight();
	const sun = new THREE.DirectionalLight();
	sun.position.set(-4.5, 10, 5.5);
	scene.add(hemi, sun);

	/* ---------- build the world ---------- */

	const world = new THREE.Group(); // everything that floats together
	scene.add(world);

	// grid squares per unit of land, capped by the total, so a bigger map doesn't get heavier to draw.
	// the low tiers use a coarser ground with a quarter of the triangles
	const full = Math.min(phone ? 11 : 16, Math.sqrt((phone ? 20000 : 40000) / (WIDTH * DEPTH)));
	const groundDetail = { full, reduced: full / 2 };
	const ground = makeGround(groundDetail[adaptive.tier.detail]);
	const groundGeometries: Partial<Record<Tier['detail'], THREE.BufferGeometry>> = { [adaptive.tier.detail]: ground.mesh.geometry };
	const water = makeWater();
	const sides = makeSides();
	const shadow = makeShadow();
	const trail = makeTrail();
	const pins = makePins();
	const rand = seeded(7);
	// the things from world.ts (tiny me, the server rack...), each stood on the ground
	const things = WORLD.map(({ make, x, z, turn = 0, size = 1 }) => {
		const thing = make();
		onGround(thing.object, x, z, turn, size);
		return thing;
	});
	// trees stay off the trail, the stops and those things
	const keepClear = [
		...trail.samples.filter((_, i) => i % 8 === 0),
		...STOPS.map((s) => new THREE.Vector3(s.x, 0, s.z)),
		...WORLD.map((p) => new THREE.Vector3(p.x, 0, p.z)),
	];
	const trees = makeTrees(rand, keepClear);
	const city = makeCityLights(rand);

	const treeTotal = trees.mesh.count;
	const lightTotal = city.mesh.geometry.attributes.position.count;
	// draw the ground before the water, so the water hidden under the land gets skipped by the depth test
	ground.mesh.renderOrder = -1;
	water.mesh.renderOrder = 1;

	world.add(ground.mesh, water.mesh, sides.mesh, trail.mesh, trail.walker, trees.mesh, city.mesh);
	things.forEach((thing) => world.add(thing.object));
	pins.forEach((pin) => world.add(pin.group));
	scene.add(shadow.mesh); // the shadow stays put while the world bobs above it

	/* ---------- light / dark ---------- */

	const toColors = (hex: Record<ColorKey, string>) =>
		Object.fromEntries(Object.entries(hex).map(([key, value]) => [key, new THREE.Color(value)])) as Record<ColorKey, THREE.Color>;
	const light = toColors(colors.light);
	const dark = toColors(colors.dark);
	const now = toColors(colors.light); // the blended colors actually in use

	// hook the shaders up to the blended colors once. after that, changing `now` recolors everything
	Object.assign(ground.uniforms, {
		uSand: { value: now.sand },
		uLow: { value: now.low },
		uMid: { value: now.mid },
		uHigh: { value: now.high },
		uRock: { value: now.rock },
		uLine: { value: now.line },
	});
	Object.assign(sides.uniforms, {
		uStrataA: { value: now.strataA },
		uStrataB: { value: now.strataB },
		uStrataC: { value: now.strataC },
		uWaterSide: { value: now.waterSide },
		uGrass: { value: now.grass },
	});
	Object.assign(water.uniforms, { uColor: { value: now.water }, uShine: { value: now.waterShine } });
	Object.assign(trail.uniforms, { uColor: { value: now.trail }, uFaint: { value: now.trailFaint } });

	let mix = isDark() ? 1 : 0; // 0 = light, 1 = dark, in between while switching
	let shadowAllowed = adaptive.tier.shadow;
	let ambientFps = adaptive.tier.ambientFps;

	// switching quality tiers: cheaper (or better) pixels and scenery. the motion is untouched
	function applyTier(tier: Tier) {
		renderer.setPixelRatio(pixelRatioFor(tier));
		trees.mesh.count = Math.round(treeTotal * tier.trees); // (the trees are in random order, so this thins them evenly)
		city.mesh.geometry.setDrawRange(0, Math.round(lightTotal * tier.lights));
		ground.mesh.geometry = groundGeometries[tier.detail] ??= groundGeometry(groundDetail[tier.detail]);
		shadowAllowed = tier.shadow;
		ambientFps = tier.ambientFps;
		applyTheme();
		resize();
	}
	function applyTheme() {
		for (const key of Object.keys(now) as ColorKey[]) now[key].lerpColors(light[key], dark[key], mix);
		const level = (key: LevelKey) => levels.light[key] + (levels.dark[key] - levels.light[key]) * mix;
		ground.uniforms.uSunStrength.value = level('sunStrength');
		ground.uniforms.uLineAlpha.value = level('lineAlpha');
		trees.material.color.copy(now.tree);
		hemi.color.copy(now.sky);
		hemi.groundColor.copy(now.ground);
		hemi.intensity = level('hemi');
		sun.color.copy(now.sun);
		sun.intensity = level('sun');
		city.material.opacity = level('cityLights');
		shadow.material.opacity = level('shadow');
		// fully see-through things still cost a draw, so skip them
		city.mesh.visible = city.material.opacity > 0.001;
		shadow.mesh.visible = shadowAllowed && shadow.material.opacity > 0.001;
		pins.forEach((pin) => (pin.material.emissiveIntensity = level('glow') * 0.6));
	}
	applyTheme();

	/* ---------- camera shots, one per section of the page ---------- */

	const middle = new THREE.Vector3(0.3, 0.8, 0.1);
	const anchorOf = (id: string) => pins.find((pin) => pin.id === id)?.anchor ?? middle;
	function shotFor(name: string): Shot {
		// narrower screens see less side to side, so the camera backs up to fit (phones the most)
		const fit = Math.min(Math.max(1, 1.7 / camera.aspect), 1.9);
		const big = Math.max(WIDTH / 12, DEPTH / 8); // a bigger map needs the overview to back up more
		if (name === 'intro') return frameShot(middle, new THREE.Vector3(0.5, 0.8, 1), 26 * fit * big, 'right', camera);
		if (name === 'contact') return frameShot(middle, new THREE.Vector3(-0.5, 1.2, 0.9), 27 * fit * big, 'center', camera);
		// from the summit, look back down over the whole trail
		if (name === 'summit') return frameShot(anchorOf('summit'), new THREE.Vector3(0.45, 0.75, -0.8), 7.5 * fit, 'left', camera);
		return frameShot(anchorOf(name), new THREE.Vector3(0.45, 0.85, 1), 9 * fit, 'left', camera);
	}

	const names = stepNames();
	let shots = names.map(shotFor);
	// how much of the trail is "walked" at each section: none at the intro, all of it by the summit
	const walkedAt = names.map((name) => (name === 'intro' ? 0 : name === 'summit' || name === 'contact' ? 1 : (trail.progressAt.get(name) ?? 0)));

	let needsDraw = true; // set whenever something changes that needs a fresh frame
	// the canvas size, saved here so the frame loop never has to ask the page for it
	// (asking for sizes mid-frame can make the browser recalculate the whole layout)
	let viewW = 0;
	let viewH = 0;
	function resize() {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		if (!w || !h) return;
		viewW = w;
		viewH = h;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		shots = names.map(shotFor); // framing depends on the screen shape
		needsDraw = true;
	}
	resize();
	new ResizeObserver(() => {
		resize();
		wake();
	}).observe(canvas);

	/* ---------- labels + mouse ---------- */

	const labelFor = new Map<string, HTMLElement>();
	let hovered = '';
	// hovering a label makes its pin grow. that takes the map a few frames, then it can rest again
	let animateUntil = 0;
	const setHovered = (id: string) => {
		hovered = id;
		animateUntil = performance.now() + 500;
		wake(false);
	};
	labels.querySelectorAll<HTMLElement>('[data-stop]').forEach((el) => {
		const id = el.dataset.stop!;
		labelFor.set(id, el);
		el.addEventListener('pointerenter', () => setHovered(id));
		el.addEventListener('pointerleave', () => setHovered(''));
	});

	// the camera leans a little toward the mouse, but only while the mouse is over the map itself.
	// over a card, a link, a demo or a label, the 3D stays put: labels stay still under the cursor,
	// and hovering things on the page never costs a 3D redraw
	const pointer = new THREE.Vector2();
	const content = '.card, .intro-copy, .top, [data-trail-bar], a, button';
	window.addEventListener(
		'pointermove',
		(e) => {
			if (e.pointerType !== 'mouse' || (e.target as Element | null)?.closest?.(content)) return;
			pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
			wake();
		},
		{ passive: true },
	);

	// put each html label on top of its pin (3D position → 2D screen position).
	// it only touches the page when a label actually moved, since that's work for the browser too
	const projected = new THREE.Vector3();
	const lastTransform = new Map<HTMLElement, string>();
	function placeLabels(active: string) {
		const w = viewW;
		const h = viewH;
		const mode = labelFor.has(active) ? 'focus' : 'all';
		if (labels.dataset.mode !== mode) labels.dataset.mode = mode;
		for (const pin of pins) {
			const el = labelFor.get(pin.id);
			if (!el) continue;
			projected.copy(pin.anchor);
			projected.y += world.position.y;
			projected.project(camera);
			const x = ((projected.x + 1) / 2) * w;
			const y = ((1 - projected.y) / 2) * h;
			const transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
			if (lastTransform.get(el) !== transform) {
				el.style.transform = transform;
				lastTransform.set(el, transform);
			}
			el.toggleAttribute('data-off', projected.z > 1 || Math.abs(projected.x) > 1.1 || Math.abs(projected.y) > 1.1);
			el.toggleAttribute('data-active', pin.id === active);
		}
	}

	/* ---------- debug: click the land to get its coordinates ---------- */

	// open the site with ?debug on the end (localhost:4321/?debug) and click anywhere on the land.
	// it copies `map: { x, z }` for that spot, ready to paste into projects.ts for a new stop
	if (new URLSearchParams(location.search).has('debug')) {
		const ray = new THREE.Raycaster();
		const ndc = new THREE.Vector2();
		const note = document.createElement('p');
		note.style.cssText =
			'position:fixed;left:50%;top:72px;translate:-50% 0;z-index:30;margin:0;padding:8px 14px;border-radius:99px;background:#1f1c18;color:#fff;font:600 13px ui-monospace,monospace;pointer-events:none';
		note.textContent = 'debug: click the map to pick a spot';
		document.body.appendChild(note);

		window.addEventListener('click', (e) => {
			if ((e.target as HTMLElement).closest('a, button, header, nav, .card, .intro-copy')) return;
			// shoot a ray from the camera through the mouse, and see where it hits the ground
			ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
			ray.setFromCamera(ndc, camera);
			const hit = ray.intersectObject(ground.mesh)[0];
			if (!hit) return;
			const spot = `map: { x: ${hit.point.x.toFixed(2)}, z: ${hit.point.z.toFixed(2)} },`;
			note.textContent = `${spot}  (copied)`;
			navigator.clipboard?.writeText(spot).catch(() => {});
		});
	}

	/* ---------- every frame ---------- */

	const goal: Shot = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
	const cam: Shot = { pos: shots[0].pos.clone(), look: shots[0].look.clone() };
	const smoothPointer = new THREE.Vector2();
	const right = new THREE.Vector3();
	let walked = 0;
	let time = 0;
	let lastTick = performance.now();
	let lastDraw = 0;
	let lastInput = performance.now();
	let drewLastTick = false; // did the previous tick draw? (its cost shows up in this tick's timing)

	// the loop runs while the page is visible, drawing only when something moves (browsers pause it
	// in hidden tabs on their own). it only switches off completely after 2 minutes without any
	// input, so someone reading a card still sees the world moving
	let ready = false; // the shaders are compiled, so it's ok to start drawing
	let running = false;
	// input = someone's using the page (scrolling, moving over the map), which restarts the 2 minutes.
	// wake(false) just draws whatever needs drawing
	function wake(input = true) {
		if (input) lastInput = performance.now();
		if (running || !ready) return;
		running = true;
		lastTick = performance.now();
		renderer.setAnimationLoop(frame);
	}
	function sleep() {
		running = false;
		drewLastTick = false;
		renderer.setAnimationLoop(null);
	}
	window.addEventListener('scroll', () => wake(), { passive: true });
	window.addEventListener('resize', () => wake(), { passive: true });
	// switching light/dark mode: fade the map to match
	new MutationObserver(() => wake(false)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
	// coming back to this tab, or the graphics card resetting: draw one fresh frame
	const redraw = () => {
		needsDraw = true;
		wake(false);
	};
	document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && redraw());
	canvas.addEventListener('webglcontextrestored', redraw);

	function frame(timestamp: number) {
		const gap = timestamp - lastTick;
		lastTick = timestamp;
		// how long the frame drawn on the previous tick took: that's what the quality tiers go by
		if (drewLastTick) adaptive.sample(gap);
		drewLastTick = false;

		// 1. where should the camera be for this scroll position? (cheap, so it runs every tick)
		const t = Math.min(trailProgress(), shots.length - 1);
		const i = Math.max(0, Math.min(Math.floor(t), shots.length - 2));
		const next = Math.min(i + 1, shots.length - 1);
		const e = blendShots(shots[i], shots[next], t - i, goal);
		const walkedGoal = walkedAt[i] + (walkedAt[next] - walkedAt[i]) * e;
		const target = isDark() ? 1 : 0;

		// what needs drawing?
		//   moving (camera, trail, hover, day/night): every frame, up to 60 a second, on every tier
		//   still: decorative motion (water, waving, blinking) at the tier's ambient rate
		//   resting: nobody has touched the page for 2 minutes, or they asked for reduced motion
		const moving =
			cam.pos.distanceToSquared(goal.pos) > 1e-6 ||
			cam.look.distanceToSquared(goal.look) > 1e-6 ||
			Math.abs(walkedGoal - walked) > 1e-4 ||
			(!still && smoothPointer.distanceToSquared(pointer) > 1e-4) || // the camera following the mouse
			mix !== target ||
			timestamp < animateUntil; // a label was just hovered, so its pin is growing or shrinking
		const resting = still || timestamp - lastInput > 120000;
		if (!needsDraw && !moving && resting) return sleep();
		if (!needsDraw && timestamp - lastDraw < 1000 / (moving ? 60 : ambientFps) - 3) return;

		const dt = Math.min(0.05, (timestamp - lastDraw) / 1000);
		lastDraw = timestamp;
		needsDraw = false;
		if (!still) time += dt;

		// 2. glide toward it instead of snapping there, so fast scrolling still looks smooth
		const k = still ? 1 : 1 - Math.exp(-dt * 4.5);
		cam.pos.lerp(goal.pos, k);
		cam.look.lerp(goal.look, k);
		walked += (walkedGoal - walked) * k;

		// 3. a slow sway, plus a little follow-the-mouse, so it never looks frozen
		smoothPointer.lerp(pointer, still ? 0 : 1 - Math.exp(-dt * 3));
		right.subVectors(cam.look, cam.pos).cross(camera.up).normalize();
		camera.position
			.copy(cam.pos)
			.addScaledVector(right, smoothPointer.x * 0.35 + Math.sin(time * 0.2) * 0.25)
			.addScaledVector(camera.up, -smoothPointer.y * 0.2);
		camera.lookAt(cam.look);

		// 4. the little moving parts
		world.position.y = Math.sin(time * 0.6) * 0.05;
		water.uniforms.uTime.value = time;
		trail.uniforms.uTime.value = time;
		trail.uniforms.uProgress.value = walked;
		trail.walker.visible = walked > 0.01;
		trail.path.getPointAt(THREE.MathUtils.clamp(walked, 0, 1), trail.walker.position);
		trail.walker.position.y += 0.04;
		const active = names[Math.round(t)] ?? 'intro';
		for (const pin of pins) {
			const focused = pin.id === active || pin.id === hovered;
			const size = focused ? 1.3 : 1;
			pin.head.scale.setScalar(THREE.MathUtils.lerp(pin.head.scale.x, size, 1 - Math.exp(-dt * 8)));
			pin.head.position.y = (pin.id === 'summit' ? 0.5 : 0.52) + Math.sin(time * 2 + pin.group.position.x) * 0.02;
			// the ring ripples on the stop you're at ("you are here"). on the overview shots every stop
			// ripples, so they look clickable. otherwise the rings sit still
			const rippling = labelFor.has(active) ? pin.id === active : true;
			const pulse = rippling ? (time * 0.7 + pin.group.position.x * 0.3) % 1 : 0;
			pin.ring.scale.setScalar(1 + pulse * 1.3);
			(pin.ring.material as THREE.MeshBasicMaterial).opacity = rippling ? 0.55 * (1 - pulse) : 0.3;
		}
		for (const thing of things) thing.update?.(time);

		// 5. fade between light and dark when the theme changes
		if (mix !== target) {
			mix = still ? target : approach(mix, target, dt * 1.4);
			applyTheme();
		}

		renderer.render(scene, camera);
		placeLabels(active);
		drewLastTick = true;
		// fade the map in once there's a first frame to show (instead of popping in)
		canvas.parentElement?.classList.add('ready');
	}

	// get the graphics card to prepare all the shaders first (without freezing the page),
	// then start drawing. otherwise the very first frame stutters while it does that work
	applyTier(adaptive.tier);
	renderer
		.compileAsync(scene, camera)
		.catch(() => {})
		.then(() => {
			ready = true;
			wake();
		});
}
