// the map's colors for light mode (a sunny afternoon) and dark mode (night, with the
// contour lines glowing like a map on a screen). switching themes blends between the two

export const colors = {
	light: {
		sand: '#e7d9b1',
		low: '#a9c58b',
		mid: '#8eb279',
		high: '#709a61',
		rock: '#b9a488',
		line: '#3f4a33',
		strataA: '#d3b287',
		strataB: '#bc986e',
		strataC: '#a37f58',
		waterSide: '#6ea6cf',
		grass: '#93b67c',
		water: '#7db6dc',
		waterShine: '#e6f4ff',
		trail: '#e8492a',
		trailFaint: '#8d8272',
		tree: '#ffffff', // multiplies each tree's own green
		sky: '#fff5e6', // light from above
		ground: '#b6a687', // light bouncing up from below
		sun: '#fff0d4',
	},
	dark: {
		sand: '#2a3140',
		low: '#1c2b3a',
		mid: '#192736',
		high: '#152331',
		rock: '#282d3a',
		line: '#72acff',
		strataA: '#29253a',
		strataB: '#211e2e',
		strataC: '#1a1824',
		waterSide: '#12294a',
		grass: '#1f3a3a',
		water: '#0e2340',
		waterShine: '#5d86cc',
		trail: '#ff7a57',
		trailFaint: '#4b5670',
		tree: '#7a8fa6',
		sky: '#8ea6d8',
		ground: '#161b28',
		sun: '#a8bcff', // moonlight
	},
};

export const levels = {
	light: { sunStrength: 1, lineAlpha: 0.3, hemi: 1.8, sun: 2.4, cityLights: 0, glow: 0, shadow: 0.22 },
	dark: { sunStrength: 0.55, lineAlpha: 0.24, hemi: 0.8, sun: 1.1, cityLights: 1, glow: 0.9, shadow: 0 },
};

export type ColorKey = keyof typeof colors.light;
export type LevelKey = keyof typeof levels.light;
