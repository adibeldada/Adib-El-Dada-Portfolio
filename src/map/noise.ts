// smooth "random hills" (value noise, stacked a few times = fbm).
// it's deterministic, so the map comes out exactly the same on every load

function hash(x: number, y: number) {
	const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
	return s - Math.floor(s);
}

function noise(x: number, y: number) {
	const xi = Math.floor(x);
	const yi = Math.floor(y);
	const u = x - xi;
	const v = y - yi;
	// random values at the 4 corners of the grid cell, blended smoothly across it
	const a = hash(xi, yi);
	const b = hash(xi + 1, yi);
	const c = hash(xi, yi + 1);
	const d = hash(xi + 1, yi + 1);
	const su = u * u * (3 - 2 * u);
	const sv = v * v * (3 - 2 * v);
	return (a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv) * 2 - 1; // -1..1
}

// big hills + medium hills + small bumps, each half as strong as the last
export function fbm(x: number, y: number, octaves = 4) {
	let sum = 0;
	let amp = 0.5;
	let freq = 1;
	for (let i = 0; i < octaves; i++) {
		sum += amp * noise(x * freq, y * freq);
		amp *= 0.5;
		freq *= 2;
	}
	return sum;
}

// a tiny seeded random number generator, for placing trees and lights the same way every time
export function seeded(seed: number) {
	return () => {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	};
}
