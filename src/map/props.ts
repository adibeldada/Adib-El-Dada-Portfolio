// the little software things hidden around the map, each one next to the project it's about.
// they're built from simple shapes with build() from kit.ts, so a new one is mostly a list of
// boxes and spheres. where each one goes is decided in world.ts

import type * as THREE from 'three';
import { build, type Part } from './kit';
import type { Thing } from './world';

// a server rack by BridgeAid, the servers behind its live map. one light blinks like it's busy
export function serverRack(): Thing {
	const object = build(
		[
			{ shape: 'box', size: [0.12, 0.22, 0.09], at: [0, 0.11, 0], color: '#2b2f38' },
			{ shape: 'box', size: [0.1, 0.034, 0.006], at: [0, 0.18, 0.046], color: '#434a58' },
			{ shape: 'box', size: [0.1, 0.034, 0.006], at: [0, 0.135, 0.046], color: '#434a58' },
			{ shape: 'box', size: [0.1, 0.034, 0.006], at: [0, 0.09, 0.046], color: '#434a58' },
			{ shape: 'box', size: [0.012, 0.012, 0.006], at: [-0.034, 0.18, 0.05], color: '#3ccf7f', glow: true },
			{ shape: 'box', size: [0.012, 0.012, 0.006], at: [-0.034, 0.135, 0.05], color: '#3ccf7f', glow: true },
		],
		0.1,
	);
	const busy = build([{ shape: 'box', size: [0.012, 0.012, 0.006], at: [-0.034, 0.09, 0.05], color: '#ffb020', glow: true }]);
	object.add(busy);
	return { object, update: (time) => (busy.visible = Math.sin(time * 7) > -0.2) };
}

// an old beige terminal on a little desk by Anattack (a terminal app in C). the cursor blinks
export function terminal(): Thing {
	const leg = (x: number, z: number) => ({ shape: 'box' as const, size: [0.012, 0.064, 0.012], at: [x, 0.032, z] as [number, number, number], color: '#7a5a3e' });
	const object = build(
		[
			{ shape: 'box', size: [0.22, 0.012, 0.13], at: [0, 0.07, 0], color: '#9a7350' },
			leg(-0.1, -0.055),
			leg(0.1, -0.055),
			leg(-0.1, 0.055),
			leg(0.1, 0.055),
			{ shape: 'box', size: [0.11, 0.09, 0.09], at: [0, 0.122, -0.015], color: '#e2dccd' },
			{ shape: 'box', size: [0.086, 0.062, 0.004], at: [0, 0.124, 0.031], color: '#10301c' },
			{ shape: 'box', size: [0.09, 0.006, 0.03], at: [0, 0.079, 0.042], color: '#cfc7b6' },
			// three lines of code on the screen
			{ shape: 'box', size: [0.046, 0.005, 0.002], at: [-0.014, 0.139, 0.034], color: '#7ce38b', glow: true },
			{ shape: 'box', size: [0.03, 0.005, 0.002], at: [-0.022, 0.128, 0.034], color: '#7ce38b', glow: true },
			{ shape: 'box', size: [0.052, 0.005, 0.002], at: [-0.011, 0.117, 0.034], color: '#7ce38b', glow: true },
		],
		0.13,
	);
	const cursor = build([{ shape: 'box', size: [0.008, 0.01, 0.002], at: [-0.03, 0.106, 0.034], color: '#7ce38b', glow: true }]);
	object.add(cursor);
	return { object, update: (time) => (cursor.visible = time % 1 < 0.55) };
}

// a tiny robot by TriageFlow (the AI that reads the intake). it looks around now and then
export function robot(): Thing {
	const object = build(
		[
			{ shape: 'cylinder', size: [0.011, 0.04], at: [-0.02, 0.02, 0], color: '#7d838f' },
			{ shape: 'cylinder', size: [0.011, 0.04], at: [0.02, 0.02, 0], color: '#7d838f' },
			{ shape: 'box', size: [0.075, 0.065, 0.055], at: [0, 0.07, 0], color: '#e9e5dc' },
			{ shape: 'box', size: [0.03, 0.02, 0.004], at: [0, 0.075, 0.029], color: '#ff5f6d' },
		],
		0.07,
	);
	const head = build([
		{ shape: 'box', size: [0.066, 0.048, 0.052], color: '#f5f2ea' },
		{ shape: 'box', size: [0.05, 0.018, 0.004], at: [0, 0.002, 0.027], color: '#1c2533' },
		{ shape: 'sphere', size: [0.0065], at: [-0.012, 0.002, 0.03], color: '#4fb0ff', glow: true },
		{ shape: 'sphere', size: [0.0065], at: [0.012, 0.002, 0.03], color: '#4fb0ff', glow: true },
		{ shape: 'cylinder', size: [0.003, 0.03], at: [0, 0.038, 0], color: '#7d838f' },
		{ shape: 'sphere', size: [0.008], at: [0, 0.056, 0], color: '#ff5f6d', glow: true },
	]);
	head.position.y = 0.128;
	object.add(head);
	return { object, update: (time) => (head.rotation.y = Math.sin(time * 0.7) * 0.6) };
}

// a desk by KeyTrace with two stools (it's for practicing together). the editor on the screen replays a
// session: the code types itself in as the playhead moves along the timeline, then it rewinds and
// plays again
export function replayDesk(): Thing {
	const leg = (x: number, z: number): Part => ({ shape: 'box', size: [0.01, 0.064, 0.01], at: [x, 0.032, z], color: '#3a3f4a' });
	const stool = (x: number): Part[] => [
		{ shape: 'cylinder', size: [0.005, 0.05], at: [x, 0.025, 0.115], color: '#3a3f4a' },
		{ shape: 'cylinder', size: [0.024, 0.008], at: [x, 0.052, 0.115], color: '#14B8A6' },
	];
	const object = build(
		[
			{ shape: 'box', size: [0.26, 0.012, 0.13], at: [0, 0.07, 0], color: '#ddd8cc' },
			leg(-0.118, -0.054),
			leg(0.118, -0.054),
			leg(-0.118, 0.054),
			leg(0.118, 0.054),
			{ shape: 'box', size: [0.05, 0.004, 0.03], at: [0, 0.078, -0.03], color: '#2b2f38' },
			{ shape: 'box', size: [0.012, 0.04, 0.012], at: [0, 0.098, -0.034], color: '#2b2f38' },
			{ shape: 'box', size: [0.16, 0.1, 0.008], at: [0, 0.16, -0.03], color: '#23262e' },
			{ shape: 'box', size: [0.1, 0.005, 0.032], at: [0, 0.079, 0.03], color: '#cfcac0' },
			...stool(-0.05),
			...stool(0.05),
			// the editor's dark background, and the replay timeline along the bottom of the screen
			{ shape: 'box', size: [0.148, 0.088, 0.002], at: [0, 0.16, -0.0255], color: '#151c27', glow: true },
			{ shape: 'box', size: [0.128, 0.003, 0.002], at: [0, 0.124, -0.024], color: '#3d4a5c', glow: true },
		],
		0.15,
	);
	// the code, one box per line (left edge, width, indent level, color), revealed line by line
	const lines: [number, number, string][] = [
		[0.07, 0, '#5EEAD4'],
		[0.05, 1, '#e6edf3'],
		[0.064, 2, '#F28CCB'],
		[0.04, 2, '#e6edf3'],
		[0.056, 1, '#5EEAD4'],
		[0.02, 0, '#e6edf3'],
	];
	const code = build(
		lines.map(([width, indent, color], i) => ({
			shape: 'box' as const,
			size: [width, 0.005, 0.002],
			at: [-0.062 + indent * 0.012 + width / 2, 0.192 - i * 0.011, -0.024] as [number, number, number],
			color,
			glow: true,
		})),
	);
	const codeLines = (code.children[0] as THREE.Mesh).geometry;
	const playhead = build([{ shape: 'box', size: [0.005, 0.011, 0.003], at: [0, 0.124, -0.023], color: '#5EEAD4', glow: true }]);
	object.add(code, playhead);
	return {
		object,
		update: (time) => {
			// 5s playing, a moment on the finished code, then a quick rewind. (it starts on the finished
			// code, so the screen isn't empty on the first frame)
			const t = (time + 5.5) % 7;
			const played = t < 5 ? t / 5 : t < 6.2 ? 1 : 1 - (t - 6.2) / 0.8;
			playhead.position.x = -0.062 + played * 0.124;
			codeLines.setDrawRange(0, 36 * Math.round(played * lines.length)); // (a box is 36 corners)
		},
	};
}

// a bus stop by RouteScore, with a bus waiting at it and a little cloud overhead. every couple of
// seconds a bit of data floats up from the bus into the cloud, like the live feed being saved to S3
export function busStop(): Thing {
	const wheel = (x: number): Part => ({ shape: 'cylinder', size: [0.014, 0.074], at: [x, 0.016, 0], turn: [Math.PI / 2, 0, 0], color: '#22252b' });
	const object = build(
		[
			// the stop: a pole, its sign, and a little arrivals board
			{ shape: 'cylinder', size: [0.005, 0.2], at: [0.11, 0.1, 0.02], color: '#8a8f99' },
			{ shape: 'box', size: [0.05, 0.034, 0.006], at: [0.11, 0.19, 0.02], color: '#C13584' },
			{ shape: 'box', size: [0.036, 0.008, 0.007], at: [0.11, 0.194, 0.02], color: '#f5f2ea' },
			{ shape: 'box', size: [0.04, 0.024, 0.005], at: [0.11, 0.152, 0.02], color: '#1c2533' },
			// the bus
			{ shape: 'box', size: [0.2, 0.068, 0.07], at: [-0.06, 0.05, 0], color: '#f2f0ea' },
			{ shape: 'box', size: [0.202, 0.014, 0.072], at: [-0.06, 0.026, 0], color: '#C13584' },
			{ shape: 'box', size: [0.186, 0.022, 0.072], at: [-0.064, 0.066, 0], color: '#1f2a38' },
			{ shape: 'box', size: [0.004, 0.034, 0.062], at: [0.04, 0.058, 0], color: '#1f2a38' },
			wheel(-0.12),
			wheel(0.0),
			// lights: the board's two lines, the bus's headlights and its route sign
			{ shape: 'box', size: [0.026, 0.004, 0.002], at: [0.108, 0.157, 0.023], color: '#3ccf7f', glow: true },
			{ shape: 'box', size: [0.018, 0.004, 0.002], at: [0.104, 0.148, 0.023], color: '#ffb020', glow: true },
			{ shape: 'box', size: [0.003, 0.008, 0.012], at: [0.0415, 0.032, 0.022], color: '#ffe8a3', glow: true },
			{ shape: 'box', size: [0.003, 0.008, 0.012], at: [0.0415, 0.032, -0.022], color: '#ffe8a3', glow: true },
			{ shape: 'box', size: [0.003, 0.009, 0.034], at: [0.0415, 0.078, 0], color: '#ffb020', glow: true },
		],
		0.16,
	);
	const cloud = build([
		{ shape: 'sphere', size: [0.05], at: [0, 0, 0], color: '#ffffff' },
		{ shape: 'sphere', size: [0.037], at: [-0.056, -0.012, 0.004], color: '#ffffff' },
		{ shape: 'sphere', size: [0.04], at: [0.054, -0.01, -0.004], color: '#ffffff' },
		{ shape: 'sphere', size: [0.03], at: [0.022, 0.032, -0.01], color: '#ffffff' },
	]);
	const packet = build([{ shape: 'box', size: [0.012, 0.012, 0.012], color: '#F28CCB', glow: true }]);
	packet.position.set(-0.04, 0, 0.04);
	object.add(cloud, packet);
	return {
		object,
		update: (time) => {
			cloud.position.set(-0.03, 0.32 + Math.sin(time * 0.8) * 0.012, 0.06);
			// rises for 1.4s, then a short pause before the next one
			const t = ((time + 1.7) % 2) / 1.4;
			packet.visible = t < 1;
			packet.position.y = 0.1 + t * 0.18;
			packet.scale.setScalar(t < 0.8 ? 1 : (1 - t) * 5); // shrinks into the cloud
			packet.rotation.y = t * 3;
		},
	};
}
