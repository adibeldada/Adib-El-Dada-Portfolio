// a small toolkit for building things out of simple shapes, a bit like building with blocks.
// a thing is a list of parts (a box here, a sphere there, each with a color), and all the parts
// get merged into one mesh. that way even a detailed little prop costs the graphics card a single
// draw call (plus one for glowing parts), which is what keeps the scene fast as the world grows

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { heightAt } from './terrain';

export interface Part {
	// box: [width, height, depth]   sphere: [radius]   cylinder: [radius, height]
	// cone: [radius, height]        torus (a ring): [radius, thickness]
	shape: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus';
	size: number[];
	at?: [number, number, number]; // where it sits inside the thing (y is up)
	turn?: [number, number, number]; // rotation around x, y, z in radians (3.14 = half a turn)
	color: string;
	glow?: boolean; // glowing parts ignore the lighting, so they stay bright at night (screens, lights)
}

// every thing shares these materials, so the graphics card only has to prepare them once
const solid = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
const glowing = new THREE.MeshBasicMaterial({ vertexColors: true });
const shade = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.16, depthWrite: false });

function shapeOf(part: Part) {
	const [a, b] = part.size;
	switch (part.shape) {
		case 'box':
			return new THREE.BoxGeometry(part.size[0], part.size[1], part.size[2]);
		case 'sphere':
			return new THREE.IcosahedronGeometry(a, 1);
		case 'cylinder':
			return new THREE.CylinderGeometry(a, a, b, 8);
		case 'cone':
			return new THREE.ConeGeometry(a, b, 7);
		case 'torus':
			return new THREE.TorusGeometry(a, b, 6, 14);
	}
}

// one part → geometry that's already moved, turned and colored, ready to merge with the others
function prepare(part: Part) {
	const geometry = shapeOf(part).toNonIndexed(); // (parts need the same layout to be merged)
	geometry.deleteAttribute('uv');
	const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(part.turn ?? [0, 0, 0])));
	geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...(part.at ?? [0, 0, 0])), rotation, new THREE.Vector3(1, 1, 1)));
	const color = new THREE.Color(part.color);
	const colors = new Float32Array(geometry.attributes.position.count * 3);
	for (let i = 0; i < colors.length; i += 3) color.toArray(colors, i);
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
	return geometry;
}

// builds a thing from its parts. `shadow` is the size of a soft dark spot under it, so it looks
// like it's standing on the ground instead of floating (leave it out for pieces that move)
export function build(parts: Part[], shadow = 0) {
	const group = new THREE.Group();
	for (const glow of [false, true]) {
		const pieces = parts.filter((part) => !!part.glow === glow).map(prepare);
		if (pieces.length) group.add(new THREE.Mesh(mergeGeometries(pieces)!, glow ? glowing : solid));
	}
	if (shadow) {
		const spot = new THREE.Mesh(new THREE.CircleGeometry(shadow, 16), shade);
		spot.rotation.x = -Math.PI / 2;
		spot.position.y = 0.004;
		group.add(spot);
	}
	return group;
}

// stands a thing on the ground at (x, z) on the map
export function onGround(object: THREE.Object3D, x: number, z: number, turn = 0, size = 1) {
	object.position.set(x, heightAt(x, z), z);
	object.rotation.y = turn;
	object.scale.setScalar(size);
}
