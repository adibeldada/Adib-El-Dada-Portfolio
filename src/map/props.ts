// the little software things hidden around the map, each one next to the project it's about.
// they're built from simple shapes with build() from kit.ts, so a new one is mostly a list of
// boxes and spheres. where each one goes is decided in world.ts

import { build } from './kit';
import type { Thing } from './world';

// a server rack by BridgeAid (I built its backend). one light blinks like it's busy
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
