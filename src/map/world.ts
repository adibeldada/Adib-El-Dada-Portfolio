// everything that decorates the map, on top of the ground, the trail and the project pins
// (those three come from terrain.ts, trail.ts and projects.ts on their own).
//
// to add something: make it in props.ts (or a new file, like me.ts), then add a line below.
//   x, z   where it goes on the map. open localhost:4321/?debug and click the land to get them
//   turn   which way it faces, in radians (0 faces the front edge by the water, 3.14 the back)
//   size   scales it, 1 = as built
// keep it to a few small things near the stops, so they feel like something you discover

import type * as THREE from 'three';
import { me } from './me';
import { serverRack, terminal, robot } from './props';

export interface Thing {
	object: THREE.Object3D;
	// optional: runs on every frame the map draws, for small animations (time is in seconds)
	update?: (time: number) => void;
}

export interface Placed {
	make: () => Thing;
	x: number;
	z: number;
	turn?: number;
	size?: number;
}

export const WORLD: Placed[] = [
	{ make: me, x: -4.3, z: 2.22, turn: 0.5, size: 1.5 }, // me, waving at the trailhead
	{ make: serverRack, x: -2.42, z: 1.55, turn: 0.35 }, // by BridgeAid, the servers behind its live map
	{ make: terminal, x: -0.22, z: 1.05, turn: -0.2 }, // by Anattack, a terminal app
	{ make: robot, x: 3.3, z: -0.6, turn: -0.4, size: 1.3 }, // by TriageFlow, the AI helper
];
