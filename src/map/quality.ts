// keeping the map smooth on every computer without taking the motion away.
// when a computer struggles, the map gets cheaper to DRAW, in this order:
//   1. fewer pixels (a slightly softer picture)
//   2. less scenery (fewer trees and city lights, no floating shadow)
//   3. a simpler ground (fewer triangles)
// what never goes away: the camera gliding between stops, the trail filling in, the stops reacting
// to you, day and night. the decorative motion (water, waving, blinking) keeps going too, it's just
// redrawn a little less often on the lowest tiers.
// the plain version of the page (no 3D, every project as a card) is the last resort: for a browser that
// can't do 3D at all, or a computer that still can't manage 10 frames a second on the lowest tier

// is the browser drawing 3D with the graphics card? it asks for a test context that refuses to run
// in software, and also checks the renderer's name, since some software renderers pass that test
export function hasGraphicsCard() {
	const gl = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true });
	if (!gl) return false;
	const info = gl.getExtension('WEBGL_debug_renderer_info');
	const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
	gl.getExtension('WEBGL_lose_context')?.loseContext(); // hand the test context straight back
	return !/swiftshader|llvmpipe|softpipe|basic render|software/i.test(name);
}

export interface Tier {
	name: string;
	resolution: number; // share of the screen's sharpness (1 = every pixel, capped at 2x)
	trees: number; // share of the trees that get drawn
	lights: number; // share of the city lights that get drawn (at night)
	shadow: boolean; // the soft shadow under the floating map
	detail: 'full' | 'reduced'; // how finely the ground is built
	ambientFps: number; // how often decorative motion redraws while the camera is still
}

export const TIERS: Tier[] = [
	{ name: 'high', resolution: 1, trees: 1, lights: 1, shadow: true, detail: 'full', ambientFps: 30 },
	{ name: 'medium', resolution: 0.8, trees: 0.7, lights: 0.8, shadow: true, detail: 'full', ambientFps: 30 },
	{ name: 'low', resolution: 0.6, trees: 0.45, lights: 0.5, shadow: false, detail: 'reduced', ambientFps: 24 },
	{ name: 'very low', resolution: 0.35, trees: 0.2, lights: 0.25, shadow: false, detail: 'reduced', ambientFps: 20 },
];

export function pixelRatioFor(tier: Tier) {
	return Math.max(0.4, Math.min(window.devicePixelRatio || 1, 2) * tier.resolution);
}

// watches how long each drawn frame takes (in groups of 12 frames, or 3 seconds when it's very slow)
// and moves between tiers:
//   too slow  → down a tier (two or three if it's very slow, so a weak computer gets help fast)
//   plenty of headroom for a few seconds → back up a tier, so a computer that was only busy for a
//   moment gets its quality back. a tier that turned out too slow is off limits for a while
//   (longer each time), so it doesn't flip back and forth
export class AdaptiveQuality {
	private frames: number[] = [];
	private goodGroups = 0;
	private settleUntil = performance.now() + 1500; // the first moments are always uneven
	private readonly blockedUntil = TIERS.map(() => 0);
	private readonly penalty = TIERS.map(() => 15000);
	private groupStart = 0;
	private slowSince = 0; // when frames started taking over 100ms on the lowest tier

	constructor(
		public level: number,
		private readonly apply: (tier: Tier) => void,
		private readonly giveUp: () => void,
	) {}

	get tier() {
		return TIERS[this.level];
	}

	// frameMs: how long the last drawn frame took, measured as the wait until the next one could start
	sample(frameMs: number) {
		const now = performance.now();
		if (now < this.settleUntil) return;

		// already on the lowest tier and every frame still takes over 100ms (under 10 a second), for 5
		// seconds straight: this computer can't run the 3D, so switch to the plain page
		if (this.level === TIERS.length - 1 && frameMs > 100) {
			this.slowSince ||= now;
			if (now - this.slowSince > 5000) return this.giveUp();
		} else {
			this.slowSince = 0;
		}

		if (!this.frames.length) this.groupStart = now;
		this.frames.push(frameMs);
		// a group is 12 frames, or at least 4 over 3 seconds (so a very slow computer gets help quickly)
		if (this.frames.length < 12 && !(this.frames.length >= 4 && now - this.groupStart > 3000)) return;
		const sorted = this.frames.sort((a, b) => a - b);
		const median = sorted[Math.floor(sorted.length / 2)];
		const worst = sorted[Math.floor(sorted.length * 0.9)]; // (the 90th percentile, so one hiccup doesn't count)
		this.frames = [];

		if (median > 30 || worst > 50) {
			this.goodGroups = 0;
			this.blockedUntil[this.level] = now + this.penalty[this.level];
			this.penalty[this.level] *= 2;
			this.go(this.level + (median > 80 ? 3 : median > 50 ? 2 : 1), now);
		} else if (worst <= 20) {
			if (++this.goodGroups >= 8 && this.level > 0 && now > this.blockedUntil[this.level - 1]) {
				this.goodGroups = 0;
				this.go(this.level - 1, now);
			}
		} else {
			this.goodGroups = 0;
		}
	}

	private go(level: number, now: number) {
		level = Math.min(TIERS.length - 1, Math.max(0, level));
		if (level === this.level) return;
		this.level = level;
		this.settleUntil = now + 1000; // switching causes one slow frame, so don't count the next second
		this.apply(TIERS[level]);
	}
}
