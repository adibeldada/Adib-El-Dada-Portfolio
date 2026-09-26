// "how far down the trail are you?" as one number. every section with a data-shot is a step:
// 0 = the intro, 1 = the first stop, and so on. in between two sections you get a fraction
// (2.5 = halfway from the second stop to the third). the 3D map and the trail bar both use this.

const sections = () => Array.from(document.querySelectorAll<HTMLElement>('[data-shot]'));
let centers: number[] = [];

// where the middle of each section is on the page. only changes when the layout does
function measure() {
	centers = sections().map((s) => {
		const r = s.getBoundingClientRect();
		return r.top + window.scrollY + r.height / 2;
	});
}

measure();
window.addEventListener('resize', measure);
new ResizeObserver(measure).observe(document.body);

// the step whose middle is at the middle of the screen
export function trailProgress() {
	const middle = window.scrollY + window.innerHeight / 2;
	if (!centers.length || middle <= centers[0]) return 0;
	for (let i = 0; i < centers.length - 1; i++) {
		if (middle < centers[i + 1]) return i + (middle - centers[i]) / (centers[i + 1] - centers[i]);
	}
	return centers.length - 1;
}

export function stepNames() {
	return sections().map((s) => s.dataset.shot!);
}
