// the little things that make it feel alive: trees, and city lights for dark mode

import * as THREE from 'three';
import { heightAt, upness, WATER, WIDTH, DEPTH } from './terrain';

// how many trees and city lights, for the amount of land. a bigger map gets more of them, so it
// looks the same instead of the same number spread thinner
const TREES = Math.round(3.1 * WIDTH * DEPTH);
const LIGHTS = Math.round(3.5 * WIDTH * DEPTH);

type Rand = () => number;

const far = (x: number, z: number, points: THREE.Vector3[], min: number) => points.every((p) => (p.x - x) ** 2 + (p.z - z) ** 2 > min * min);

// how steep the ground is at a spot (0 = flat)
const slope = (x: number, z: number) => {
	const e = 0.05;
	return Math.hypot(heightAt(x + e, z) - heightAt(x - e, z), heightAt(x, z + e) - heightAt(x, z - e)) / (2 * e);
};

// a few hundred cones. mostly up on the mountain and along the cliff edge, since the
// escarpment is covered in forest. one InstancedMesh draws them all in a single go
export function makeTrees(rand: Rand, avoid: THREE.Vector3[]) {
	const spots: { x: number; z: number; y: number; s: number }[] = [];
	for (let tries = 0; spots.length < TREES && tries < TREES * 27; tries++) {
		const x = (rand() - 0.5) * (WIDTH - 0.5);
		const z = (rand() - 0.5) * (DEPTH - 0.5);
		const y = heightAt(x, z);
		if (y < WATER + 0.12 || slope(x, z) > 1.1) continue;
		if (upness(x, z) < 0.5 && rand() > 0.16) continue; // only a few trees down in the city
		if (!far(x, z, avoid, 0.24)) continue;
		spots.push({ x, z, y, s: 0.8 + rand() * 0.5 });
	}

	const geo = new THREE.ConeGeometry(0.085, 0.28, 7);
	geo.translate(0, 0.14, 0); // so each cone sits on the ground instead of halfway in it
	const material = new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true });
	const trees = new THREE.InstancedMesh(geo, material, spots.length);
	const m = new THREE.Matrix4();
	const tint = new THREE.Color();
	spots.forEach((t, i) => {
		m.makeScale(t.s, t.s * (0.9 + rand() * 0.4), t.s).setPosition(t.x, t.y - 0.01, t.z);
		trees.setMatrixAt(i, m);
		trees.setColorAt(i, tint.setHSL(0.27 + rand() * 0.06, 0.32 + rand() * 0.12, 0.34 + rand() * 0.1));
	});
	return { mesh: trees, material };
}

// a round, soft dot texture so the lights aren't square
function dotTexture() {
	const size = 64;
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	g.addColorStop(0, 'rgba(255,255,255,1)');
	g.addColorStop(0.35, 'rgba(255,255,255,0.8)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, size, size);
	return new THREE.CanvasTexture(canvas);
}

// warm little lights all over the city. invisible in light mode, they fade in at night
export function makeCityLights(rand: Rand) {
	const points: number[] = [];
	for (let tries = 0; points.length < LIGHTS * 3 && tries < LIGHTS * 27; tries++) {
		const x = (rand() - 0.5) * (WIDTH - 0.4);
		const z = (rand() - 0.5) * (DEPTH - 0.4);
		const y = heightAt(x, z);
		const up = upness(x, z);
		if (y < WATER + 0.06 || (up > 0.15 && up < 0.85)) continue; // not in the water or on the cliff
		// busier downtown (lower city, middle-left), quieter everywhere else
		const downtown = Math.exp(-((x + 1.6) ** 2 + (z - 1.3) ** 2) / 4.5);
		if (rand() > 0.25 + downtown * 0.75) continue;
		points.push(x, y + 0.03, z);
	}
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
	const material = new THREE.PointsMaterial({
		color: '#ffd27a',
		size: 0.075,
		map: dotTexture(),
		transparent: true,
		opacity: 0,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	});
	return { mesh: new THREE.Points(geo, material), material };
}
