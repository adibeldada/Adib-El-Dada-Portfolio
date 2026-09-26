// runs a demo only while it's on screen, so four animations
// aren't looping in the background the whole time
export function whileVisible(el: Element, handlers: { start: () => void; stop?: () => void }) {
	let showing = false;
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting && !showing) {
				showing = true;
				handlers.start();
			} else if (!entry.isIntersecting && showing) {
				showing = false;
				handlers.stop?.();
			}
		},
		{ threshold: 0.35 }, // "on screen" = at least 35% of it is visible
	);
	observer.observe(el);
}
