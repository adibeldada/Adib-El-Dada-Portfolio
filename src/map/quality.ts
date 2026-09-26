// keeping the map smooth on slower computers. instead of assuming a fast graphics card,
// it adapts to whatever it's running on:
//   - it starts below the screen's full resolution, and lowers it more if frames come in slow
//   - it only redraws when something is moving, and stops completely when nobody has
//     touched the page for a while (that part lives in the loop in index.ts)
//   - without a graphics card (like chrome with "use graphics acceleration" switched off), the
//     browser draws the 3D in software on the processor. the map still shows, just simpler
//   - only a browser that can't do 3D at all gets the plain version of the page

// is the browser drawing 3D with the graphics card? it asks for a test context that refuses to
// run in software. if the browser says no, any 3D it draws is being done on the processor
export function hasGraphicsCard() {
	const gl = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true });
	gl?.getExtension('WEBGL_lose_context')?.loseContext(); // hand the test context straight back
	return gl !== null;
}

export function startingQuality(software: boolean) {
	const phone = matchMedia('(max-width: 820px)').matches;
	const dpr = window.devicePixelRatio || 1;
	return {
		// smooths jagged edges. the graphics card does it in hardware, so it's cheap. on sharp 2x
		// screens the extra pixels already hide the jaggies, so it's skipped there
		antialias: !software && dpr < 2,
		// drawing at exactly the screen's resolution is sharpest (a canvas stretched to fit looks
		// soft), up to 2x. if frames get slow, AdaptiveResolution below lowers it.
		// drawn in software, it starts small
		pixelRatio: software ? 0.75 : Math.min(dpr, 2),
		// frames per second when nothing is moving (the water still shimmers, just less often).
		// in software it doesn't animate while you read at all, to save the processor
		idleFps: software ? 0 : phone ? 24 : 30,
	};
}

// watches how far apart frames actually arrive. if the computer can't keep up, it lowers the
// resolution a step at a time, down to 0.6. if it *still* can't keep up at 0.6, it calls
// giveUp(), and the map switches to only drawing one frame per stop (see index.ts)
export class AdaptiveResolution {
	private slowFrames = 0;
	private gaveUp = false;
	private readonly startedAt = performance.now();

	constructor(
		public pixelRatio: number,
		private readonly apply: (pixelRatio: number) => void,
		private readonly giveUp: () => void,
	) {}

	frame(gapMs: number) {
		// ignore the very first moment after starting, which is always a little uneven
		if (this.gaveUp || performance.now() - this.startedAt < 500) return;
		// a gap over ~28ms means we're under ~35 frames a second. really slow frames (over 50ms)
		// count double, so a computer that's struggling badly gets helped sooner
		if (gapMs > 28) this.slowFrames += gapMs > 50 ? 2 : 1;
		else this.slowFrames = Math.max(0, this.slowFrames - 1);
		if (this.slowFrames <= 12) return;

		this.slowFrames = 0;
		if (this.pixelRatio > 0.6) {
			this.pixelRatio = Math.max(0.6, Math.round((this.pixelRatio - 0.25) * 100) / 100);
			this.apply(this.pixelRatio);
		} else {
			this.gaveUp = true;
			this.giveUp();
		}
	}
}
