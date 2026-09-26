// tiny me: curly hair, glasses, standing at the trailhead and waving every now and then.
// change these colors to make it look more like me

import { build, type Part } from './kit';
import type { Thing } from './world';

const SKIN = '#c68c68';
const HAIR = '#2b1d14';
const HOODIE = '#e8492a'; // the site's orange
const PANTS = '#2e3440';
const GLASSES = '#141414';

// the curls: little bumps over the top, sides and back of the head (the face is at +z)
const curls: [number, number, number][] = [
	[0, 0.184, 0.004],
	[-0.016, 0.18, 0.006],
	[0.016, 0.18, 0.006],
	[-0.024, 0.168, -0.004],
	[0.024, 0.168, -0.004],
	[-0.01, 0.182, -0.014],
	[0.01, 0.182, -0.014],
	[0, 0.172, -0.024],
	[-0.02, 0.157, -0.016],
	[0.02, 0.157, -0.016],
	[0, 0.182, 0.016],
];

export function me(): Thing {
	const parts: Part[] = [
		{ shape: 'cylinder', size: [0.011, 0.06], at: [-0.013, 0.03, 0], color: PANTS },
		{ shape: 'cylinder', size: [0.011, 0.06], at: [0.013, 0.03, 0], color: PANTS },
		{ shape: 'cylinder', size: [0.03, 0.075], at: [0, 0.097, 0], color: HOODIE },
		{ shape: 'cylinder', size: [0.009, 0.058], at: [-0.036, 0.095, 0], turn: [0, 0, -0.15], color: HOODIE },
		{ shape: 'sphere', size: [0.028], at: [0, 0.158, 0], color: SKIN },
		...curls.map((at): Part => ({ shape: 'sphere', size: [0.0125], at, color: HAIR })),
		{ shape: 'torus', size: [0.0085, 0.0022], at: [-0.011, 0.16, 0.029], color: GLASSES },
		{ shape: 'torus', size: [0.0085, 0.0022], at: [0.011, 0.16, 0.029], color: GLASSES },
		{ shape: 'box', size: [0.006, 0.002, 0.002], at: [0, 0.161, 0.03], color: GLASSES },
	];
	const object = build(parts, 0.045);

	// the waving arm is its own piece so it can move. it swings from the shoulder
	const arm = build([{ shape: 'cylinder', size: [0.009, 0.058], at: [0, 0.029, 0], color: HOODIE }]);
	arm.position.set(0.034, 0.122, 0);
	object.add(arm);

	const down = -Math.PI + 0.15; // arm hanging by the side
	const up = -0.5; // arm raised to wave
	return {
		object,
		update: (time) => {
			// waves for a couple of seconds, rests for a bit, waves again
			const waving = Math.max(0, Math.sin(time * 0.9)) ** 2;
			arm.rotation.z = down + (up + Math.sin(time * 9) * 0.35 - down) * waving;
		},
	};
}
