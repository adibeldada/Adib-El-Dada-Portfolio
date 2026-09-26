// shared animation stuff. the spring curves are defined once in global.css
// and read from there so css and js always move the same way.

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const SPRING = css('--spring') || 'ease-out';
export const BOUNCY = css('--bouncy') || 'ease-out';

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// FLIP = First, Last, Invert, Play.
// remember where every child is, let `change` shuffle the DOM, then animate each
// child from its old spot to its new one. used for the re-sorting lists.
export function flip(container: HTMLElement, change: () => void, duration = 560) {
	const before = new Map<Element, number>();
	for (const el of container.children) before.set(el, (el as HTMLElement).offsetTop);

	change();

	if (reducedMotion()) return;
	for (const el of container.children) {
		const top = before.get(el);
		if (top === undefined) continue;
		const dy = top - (el as HTMLElement).offsetTop;
		if (dy) el.animate([{ translate: `0 ${dy}px` }, { translate: '0 0' }], { duration, easing: SPRING });
	}
}
