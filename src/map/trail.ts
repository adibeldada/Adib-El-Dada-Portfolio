// the trail and its stops. the stops go in the order the projects happened, so the trail
// literally climbs: lower city → up the cliff → the summit ("next stop: your team?")

import * as THREE from 'three';
import { heightAt } from './terrain';
import { projects } from '../data/projects';

export interface Stop {
	id: string; // matches a section's data-shot on the page
	x: number;
	z: number;
	via?: [number, number][]; // bend points the trail curves through on its way to this stop
	color: string;
}

// the start of the trail, then every project (positions come from projects.ts), then the summit
export const STOPS: Stop[] = [
	{ id: 'start', x: -4.6, z: 2.1, color: '#a8683a' },
	...projects.map((p) => ({ id: p.id, x: p.map.x, z: p.map.z, via: p.map.via, color: p.icon[0] })),
	{ id: 'summit', x: 4.6, z: -2.8, color: '#e8492a' },
];

// the path the trail takes: every stop in order, curving through each project's optional bend
// points (`via` in projects.ts) on the way to it. adding a project adds it to the trail
function routePoints(): [number, number][] {
	return STOPS.flatMap((stop) => [...(stop.via ?? []), [stop.x, stop.z] as [number, number]]);
}

const trailVertex = /* glsl */ `
	varying vec2 vUv;
	void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

const trailFragment = /* glsl */ `
	uniform vec3 uColor, uFaint;
	uniform float uProgress, uTime, uLength;
	varying vec2 vUv;
	void main() {
		// vUv.x goes 0 → 1 from the start of the trail to the summit
		if (vUv.x > uProgress) {
			// the part you haven't reached yet: faint dashes that march toward the summit
			if (fract(vUv.x * uLength * 2.6 - uTime * 0.5) > 0.55) discard;
			gl_FragColor = vec4(uFaint, 1.0);
		} else {
			gl_FragColor = vec4(uColor, 1.0);
		}
		#include <colorspace_fragment>
	}
`;

export function makeTrail() {
	// smooth curve through the waypoints, then drape every point onto the ground
	const flat = new THREE.CatmullRomCurve3(routePoints().map(([x, z]) => new THREE.Vector3(x, 0, z))).getSpacedPoints(700);
	const samples = flat.map((p) => new THREE.Vector3(p.x, heightAt(p.x, p.z) + 0.035, p.z));
	const path = new THREE.CatmullRomCurve3(samples);

	// how far along the trail each stop is (0 at the start, 1 at the summit), measured by distance
	const distance = [0];
	for (let i = 1; i < samples.length; i++) distance.push(distance[i - 1] + samples[i].distanceTo(samples[i - 1]));
	const total = distance[distance.length - 1];
	const along = (stop: Stop) => {
		let best = 0;
		samples.forEach((p, i) => {
			if ((p.x - stop.x) ** 2 + (p.z - stop.z) ** 2 < (samples[best].x - stop.x) ** 2 + (samples[best].z - stop.z) ** 2) best = i;
		});
		return distance[best] / total;
	};
	const progressAt = new Map(STOPS.map((s) => [s.id, along(s)]));

	const uniforms = {
		uColor: { value: new THREE.Color() },
		uFaint: { value: new THREE.Color() },
		uProgress: { value: 0 },
		uTime: { value: 0 },
		uLength: { value: total },
	};
	const mesh = new THREE.Mesh(
		new THREE.TubeGeometry(path, 1400, 0.024, 6, false),
		new THREE.ShaderMaterial({ uniforms, vertexShader: trailVertex, fragmentShader: trailFragment }),
	);

	// a little dot that walks along the trail as you scroll
	const walker = new THREE.Mesh(new THREE.SphereGeometry(0.065, 20, 14), new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#ffffff' }));

	return { mesh, uniforms, path, samples, progressAt, walker };
}

export interface Pin {
	id: string;
	group: THREE.Group;
	head: THREE.Mesh;
	ring: THREE.Mesh;
	anchor: THREE.Vector3; // where its label goes (just above the pin)
	material: THREE.MeshLambertMaterial;
}

// a pin for every stop: a thin stick with a colored head and a ring on the ground.
// the summit gets a flag instead of a round head
export function makePins(): Pin[] {
	const stickGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6);
	const headGeo = new THREE.SphereGeometry(0.09, 24, 16);
	const ringGeo = new THREE.RingGeometry(0.11, 0.17, 40);
	ringGeo.rotateX(-Math.PI / 2);
	const flagShape = new THREE.Shape();
	flagShape.moveTo(0, 0);
	flagShape.lineTo(0.34, -0.1);
	flagShape.lineTo(0, -0.2);
	const flagGeo = new THREE.ShapeGeometry(flagShape);

	return STOPS.map((stop) => {
		const ground = heightAt(stop.x, stop.z);
		const group = new THREE.Group();
		group.position.set(stop.x, ground, stop.z);

		const material = new THREE.MeshLambertMaterial({ color: stop.color, emissive: stop.color, emissiveIntensity: 0 });
		const stick = new THREE.Mesh(stickGeo, new THREE.MeshLambertMaterial({ color: '#d8d2c6' }));
		stick.position.y = 0.25;

		const isSummit = stop.id === 'summit';
		const head = new THREE.Mesh(isSummit ? flagGeo : headGeo, material);
		if (isSummit) {
			head.position.y = 0.5;
			(head.material as THREE.MeshLambertMaterial).side = THREE.DoubleSide;
		} else {
			head.position.y = 0.52;
		}

		const ring = new THREE.Mesh(
			ringGeo,
			new THREE.MeshBasicMaterial({ color: stop.color, transparent: true, opacity: 0.55, depthWrite: false }),
		);
		ring.position.y = 0.02;

		group.add(stick, head, ring);
		return { id: stop.id, group, head, ring, material, anchor: new THREE.Vector3(stop.x, ground + 0.8, stop.z) };
	});
}
