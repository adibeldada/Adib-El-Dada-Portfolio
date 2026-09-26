// light / dark mode.
// every color is a css variable in global.css, and dark mode swaps them when
// <html data-theme="dark">, so toggling is literally just flipping that attribute.
// (the first theme gets picked in Base.astro, before the page shows up)

export function toggleTheme() {
	const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
	try {
		localStorage.setItem('theme', next);
	} catch {}

	const swap = () => (document.documentElement.dataset.theme = next);
	// crossfade the old page into the new one where the browser supports it
	if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
		document.startViewTransition(swap);
	} else {
		swap();
	}
}
