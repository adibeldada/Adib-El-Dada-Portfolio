// keeping the map smooth on slower computers. instead of assuming a fast graphics card,
// it adapts to whatever it's running on:
//   - it starts below the screen's full resolution, and lowers it more if frames come in slow
//   - it only redraws when something is moving, and stops completely when nobody has
//     touched the page for a while (that part lives in the loop in index.ts)
//   - computers with no graphics acceleration at all skip the 3D map (also in index.ts)

export function startingQuality() {
	const phone = matchMedia('(max-width: 820px)').matches;
	const dpr = window.devicePixelRatio || 1;
	const cores = navigator.hardwareConcurrency || 4;
	return {
		// smoothing jagged edges is expensive, and on sharp (high dpi) screens you barely see it
		antialias: dpr < 1.5 && cores > 4,
		// the map is soft and all the text is html, so it doesn't need every last pixel
		pixelRatio: Math.min(dpr, phone ? 1.5 : 1.75),
		// frames per second when nothing is moving (the water still shimmers, just less often)
		idleFps: cores > 4 ? 30 : 20,
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
