// which text color reads better on top of a project's color: white, or the site's near-black ink.
// used for the numbers painted on each stop's color (the cards, the map labels, the featured row),
// so a light color like teal or amber gets a dark number instead of a hard-to-read white one

const luminance = (hex: string) => {
	const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
	const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
	return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};

export function textOn(hex: string) {
	const l = luminance(hex);
	const onWhite = 1.05 / (l + 0.05);
	const onInk = (l + 0.05) / (luminance('#1f1c18') + 0.05);
	return onWhite >= onInk ? '#ffffff' : '#1f1c18';
}
