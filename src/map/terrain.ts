// the ground. it's a 12 × 8 block of land, loosely hamilton: the harbour at the front,
// the lower city, the escarpment (a cliff) across the middle, and "the mountain" behind it.
// x runs left → right, z runs back → front (toward you), y is up.
//
// heightAt() is the one source of truth for the shape. the trail, the pins and the trees
// all ask it how high the ground is at a spot.

import * as THREE from 'three';
import { fbm } from './noise';

export const WIDTH = 12;
export const DEPTH = 8;
export const WATER = 0.22; // the harbour's water level
export const BOTTOM = -1.15; // where the block's cut-away sides end

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smoothstep = (a: number, b: number, v: number) => {
	const t = clamp01((v - a) / (b - a));
	return t * t * (3 - 2 * t);
};
const bump = (x: number, z: number, cx: number, cz: number, r: number) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * r * r));

// where the cliff runs. behind this line you're up on the mountain
export const cliffZ = (x: number) => -0.3 + 0.45 * Math.sin(0.45 * x + 0.8);

// 0 down in the lower city, 1 up on the mountain, in between on the cliff
export const upness = (x: number, z: number) => 1 - smoothstep(-0.3, 0.3, z - cliffZ(x));

export function heightAt(x: number, z: number) {
	const up = upness(x, z);
	// the lower city slopes gently down into the harbour
	const lower = 0.6 - 0.62 * smoothstep(1.5, 3.3, z) + 0.12 * fbm(x * 0.55 + 3.1, z * 0.55 + 1.7);
	// up top it's rolling hills, with one peak at the back for the summit
	const upper = 1.95 + 0.28 * fbm(x * 0.32 + 9.2, z * 0.32 + 4.4) + 0.75 * bump(x, z, 4.6, -2.8, 0.95);
	let h = lower + (upper - lower) * up;
	// a flat ledge halfway up the cliff, where the catan stop sits
	h += (1.25 - h) * 0.9 * bump(x, z, 1.3, cliffZ(1.3), 0.28);
	return h;
}

/* ---------- shaders ----------
   these are tiny programs that run on the graphics card and decide the color of every pixel */

const vertex = /* glsl */ `
	varying vec3 vPos;
	varying vec3 vNormal;
	void main() {
		vPos = position;
		vNormal = normal;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

const groundFragment = /* glsl */ `
	uniform vec3 uSand, uLow, uMid, uHigh, uRock, uLine;
	uniform vec3 uSun;
	uniform float uSunStrength, uLineAlpha, uWater;
	varying vec3 vPos;
	varying vec3 vNormal;

	void main() {
		float h = vPos.y;
		vec3 n = normalize(vNormal);

		// color by height: sand at the water, greens going up
		vec3 col = mix(uSand, uLow, smoothstep(uWater, uWater + 0.22, h));
		col = mix(col, uMid, smoothstep(0.7, 1.5, h));
		col = mix(col, uHigh, smoothstep(1.8, 2.5, h));
		// steep ground (the cliff) is rock
		col = mix(col, uRock, smoothstep(0.78, 0.5, n.y));

		// light from the sun's direction, so hills get a bright side and a shadow side
		col *= 0.58 + uSunStrength * 0.5 * max(dot(n, uSun), 0.0);

		// contour lines every 0.14 units of height, like a topographic map.
		// fwidth() keeps them about 1px thick no matter how far away they are
		float v = h / 0.14;
		float line = 1.0 - min(abs(fract(v - 0.5) - 0.5) / fwidth(v), 1.0);
		float major = step(mod(floor(v + 0.5), 5.0), 0.5); // every 5th line is stronger
		col = mix(col, uLine, line * uLineAlpha * (0.5 + 0.5 * major));

		gl_FragColor = vec4(col, 1.0);
		#include <colorspace_fragment>
	}
`;

const waterFragment = /* glsl */ `
	uniform vec3 uColor, uShine;
	uniform float uTime;
	varying vec3 vPos;
	void main() {
		// two sets of slow, slanted waves crossing each other, faded in and out by a third,
		// so you get the odd soft glint instead of a neat grid of them
		float a = sin(vPos.x * 4.3 + vPos.z * 2.1 + uTime * 0.7);
		float b = sin(vPos.z * 6.1 - vPos.x * 1.7 - uTime * 0.5);
		float fade = 0.5 + 0.5 * sin(vPos.x * 0.9 - vPos.z * 1.6 + uTime * 0.25);
		vec3 col = mix(uColor, uShine, smoothstep(0.86, 1.0, a * b) * fade * 0.35);
		// a little lighter toward the back, where it meets the shore
		col = mix(col, uShine, 0.12 * smoothstep(3.6, 2.4, vPos.z));
		gl_FragColor = vec4(col, 1.0);
		#include <colorspace_fragment>
	}
`;

const sidesVertex = /* glsl */ `
	attribute float ground;
	varying vec3 vPos;
	varying vec3 vNormal;
	varying float vGround;
	void main() {
		vPos = position;
		vNormal = normal;
		vGround = ground;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

const sidesFragment = /* glsl */ `
	uniform vec3 uStrataA, uStrataB, uStrataC, uWaterSide, uGrass;
	uniform vec3 uSun;
	varying vec3 vPos;
	varying vec3 vNormal;
	varying float vGround;
	void main() {
		vec3 col;
		if (vPos.y > vGround + 0.002) {
			col = uWaterSide; // the harbour, seen from the side
		} else if (vGround - vPos.y < 0.045) {
			col = uGrass; // a thin grass lip along the top edge
		} else {
			// wavy rock layers
			float band = fract(vPos.y * 2.3 + 0.12 * sin(vPos.x * 1.7 + vPos.z * 1.3));
			col = band < 0.34 ? uStrataA : band < 0.67 ? uStrataB : uStrataC;
			col *= mix(1.0, 0.72, smoothstep(0.0, -1.1, vPos.y)); // darker toward the bottom
		}
		col *= 0.72 + 0.34 * max(dot(normalize(vNormal), uSun), 0.0);
		gl_FragColor = vec4(col, 1.0);
		#include <colorspace_fragment>
	}
`;

const SUN = new THREE.Vector3(-0.45, 1, 0.55).normalize();
const color = () => ({ value: new THREE.Color() });

/* ---------- the pieces ---------- */

// detail = grid squares per unit. more looks smoother, fewer is faster (phones get fewer)
export function makeGround(detail: number) {
	const geo = new THREE.PlaneGeometry(WIDTH, DEPTH, Math.round(WIDTH * detail), Math.round(DEPTH * detail));
	geo.rotateX(-Math.PI / 2); // lie flat
	const pos = geo.attributes.position;
	for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
	geo.computeVertexNormals();

	const uniforms = {
		uSand: color(),
		uLow: color(),
		uMid: color(),
		uHigh: color(),
		uRock: color(),
		uLine: color(),
		uSun: { value: SUN },
		uSunStrength: { value: 1 },
		uLineAlpha: { value: 0.3 },
		uWater: { value: WATER },
	};
	const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: groundFragment }));
	return { mesh, uniforms };
}

export function makeWater() {
	const geo = new THREE.PlaneGeometry(WIDTH, DEPTH);
	geo.rotateX(-Math.PI / 2);
	geo.translate(0, WATER, 0);
	const uniforms = { uColor: color(), uShine: color(), uTime: { value: 0 } };
	const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: waterFragment }));
	return { mesh, uniforms };
}

// the 4 cut-away walls around the block, so it looks like a slice of land
export function makeSides() {
	const positions: number[] = [];
	const grounds: number[] = [];
	const steps = 160;
	const hw = WIDTH / 2;
	const hd = DEPTH / 2;
	// go around the edge counter-clockwise (seen from above) so every wall faces outward
	const corners = [
		[-hw, hd],
		[hw, hd],
		[hw, -hd],
		[-hw, -hd],
		[-hw, hd],
	];
	for (let c = 0; c < 4; c++) {
		const [ax, az] = corners[c];
		const [bx, bz] = corners[c + 1];
		for (let i = 0; i < steps; i++) {
			const x0 = ax + ((bx - ax) * i) / steps;
			const z0 = az + ((bz - az) * i) / steps;
			const x1 = ax + ((bx - ax) * (i + 1)) / steps;
			const z1 = az + ((bz - az) * (i + 1)) / steps;
			const g0 = heightAt(x0, z0);
			const g1 = heightAt(x1, z1);
			// the top of the wall is the ground, or the water where the ground is underwater
			const t0 = Math.max(g0, WATER);
			const t1 = Math.max(g1, WATER);
			positions.push(x0, t0, z0, x0, BOTTOM, z0, x1, t1, z1, x1, t1, z1, x0, BOTTOM, z0, x1, BOTTOM, z1);
			grounds.push(g0, g0, g1, g1, g0, g1);
		}
	}
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geo.setAttribute('ground', new THREE.Float32BufferAttribute(grounds, 1));
	geo.computeVertexNormals();

	const uniforms = {
		uStrataA: color(),
		uStrataB: color(),
		uStrataC: color(),
		uWaterSide: color(),
		uGrass: color(),
		uSun: { value: SUN },
	};
	const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms, vertexShader: sidesVertex, fragmentShader: sidesFragment }));
	return { mesh, uniforms };
}

// a soft blurry shadow under the floating block (a radial gradient painted on a canvas)
export function makeShadow() {
	const size = 256;
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	g.addColorStop(0, 'rgba(255,255,255,1)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, size, size);

	const material = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, opacity: 0.2 });
	const mesh = new THREE.Mesh(new THREE.PlaneGeometry(WIDTH * 1.5, DEPTH * 1.6), material);
	mesh.rotation.x = -Math.PI / 2;
	mesh.position.y = BOTTOM - 0.5;
	return { mesh, material };
}
