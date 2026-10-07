# adibeldada.com

My portfolio is a 3D trail map. It's a floating slice of land (loosely Hamilton and the Niagara Escarpment) with a trail zig-zagging up it (right across the lower city, up the cliff, then back left along the top), and every stop on the trail is a project I built, most of them with a team. Scroll down the page and the camera walks the trail stop by stop, and each project's card slides in next to its stop, with a small live demo that runs the same logic as the real project. It starts at the trailhead (a short "about me") and ends at the summit (why I build).

Built with Astro, TypeScript, Three.js and plain CSS, hosted on Cloudflare Workers.

## how it works

- **The page is normal HTML.** `src/pages/index.astro` has one `<section>` per step: the intro, the trailhead (about me), one per project, the summit, and contact. Each has a `data-shot` saying which stop it belongs to.
- **The map is fixed behind the page.** `src/map/` builds the 3D scene with Three.js. The ground comes from one height function (`heightAt` in `terrain.ts`), and everything else sits on top of it: the trail, the pins, the trees.
- **Scrolling drives the camera.** `src/scripts/trail-progress.ts` turns the scroll position into one number (0 = intro, 1 = first stop, 1.5 = halfway to the second...). Every frame, the map reads that number, blends between the two closest camera "shots" (`camera.ts`), and fills in the trail up to where you are.
- **Clicking a stop** on the map (or on the bar at the bottom) is just a link to that section, so the browser scrolls there and the camera follows.
- **Dark mode** swaps the page's CSS variables, and the map fades between its day and night colors (`palette.ts`): contour lines start glowing and the city lights come on.
- **The visitor counter** is the only server code: `src/pages/api/views.ts` runs on a Cloudflare Worker and keeps the count in a D1 database.

### staying smooth on slow computers

The map adapts to the computer it's running on (`src/map/quality.ts` and the frame loop in `src/map/index.ts`). The rule: **a slow computer gets a cheaper picture, not less motion.**

- **Four quality tiers.** When frames take too long, the map drops a tier; when there's headroom for a few seconds, it climbs back up. Each tier trades picture quality, never motion:

  | tier | resolution | scenery | ground | decorative motion |
  |---|---|---|---|---|
  | high | full (up to 2x) | all trees and lights, floating shadow | full detail | redrawn 30 times a second |
  | medium | 80% | 70% of the trees | full detail | 30 |
  | low | 60% | 45% of the trees, no shadow | quarter of the triangles | 24 |
  | very low | 35% | 20% of the trees | quarter of the triangles | 20 |

- **Always kept, on every tier:** the camera gliding between stops, the trail filling in, the stops reacting to hover, day and night. While any of that is moving, every frame is drawn.
- **It only draws when something changes.** The decorative motion (water, bobbing, tiny me waving, blinking lights) keeps going while you read, at the tier's rate. The loop only switches off after 2 minutes without any input, and browsers pause it in hidden tabs on their own.
- **No graphics acceleration** (like Chrome with "Use graphics acceleration" switched off, or a software renderer like SwiftShader): the browser draws the 3D on the processor, so the map starts on the low tier with antialiasing off. Only a browser that can't do 3D at all gets a plain version of the page.
- **No backdrop blur** over the map. Blurring what's behind a card means redoing the blur every time the map redraws, which is one of the most expensive things a browser can do.

Measured on the production build. "Motion" is how many times a second the camera and world actually move on screen, which matters more than the frame rate:

| setup | before | after |
|---|---|---|
| weak laptop (software graphics, CPU at quarter speed), scrolling | motion 1/s (the camera jumped between stops) | motion 32/s, steady 33 ms frames |
| Chrome with acceleration off, scrolling | motion 5/s | motion 50/s |
| any computer, reading a card for 10 seconds | frozen | still moving (20-30/s) |

### the demos run the real logic

- **TriageFlow**: same urgency levels and sort order as the real dashboard (most urgent first, then arrival time).
- **BridgeAid**: an incident only gets verified once several different people report it close together, like the clustering in the Flask backend.
- **Catan**: the board is the actual `base_map.json` from the course repo, and undo/redo uses the Command pattern with two stacks, same as `CommandManager.java`.
- **Anattack**: real flashcards and quiz questions from the repo, the weighted card picking from `flashcards.h`, and the leaderboard re-sorting and rewriting its file.

## where things are

```
src/
  pages/
    index.astro          the whole page: intro, stops, about me, contact
    api/views.ts         the visitor counter
  map/                   the 3D map
    index.ts             puts the scene together, draws a frame whenever something moves
    world.ts             the little things on the map (tiny me, the server rack...) and where they go
    props.ts             the software things: server rack, terminal, robot
    me.ts                tiny me
    kit.ts               build(): makes objects out of simple shapes
    terrain.ts           the ground: hills, the cliff, water, the cut-away sides (and the map's size)
    trail.ts             the trail and the project pins, built from projects.ts
    scenery.ts           trees + city lights
    camera.ts            the camera shot for each section
    palette.ts           day / night colors
    quality.ts           staying smooth on slow computers
    noise.ts             smooth random hills
  components/
    TrailMap.astro       the map canvas + the labels over each stop
    StopCard.astro       a project's card
    TrailBar.astro       the progress bar at the bottom
    demos/               one live demo per project
  data/
    projects.ts          the projects, in trail order, with where each stop sits
    profile.ts           me: links, education, experience, skills
  scripts/               small helpers (scroll progress, theme, visitor count...)
  styles/global.css      colors, fonts, light + dark mode
migrations/              the database table for the counter
public/og.jpg            the picture link previews show (a screenshot of the intro, retake it if the intro changes)
```

## maintaining it yourself

### adding a new project

Everything about a project lives in **`src/data/projects.ts`**. Add an object to the `projects` list and the site builds the rest: its card, its pin and label on the map, its stretch of trail, its camera stop and its dot on the bottom bar.

```ts
{
	id: 'myproject',                  // short, no spaces. also its link: adibeldada.com/#myproject
	name: 'My Project',
	tagline: 'One line on what it does.',
	context: 'Hackathon or course name',
	when: 'Oct 2026',                 // shown exactly as written
	icon: ['#10b981', '#6ee7b7'],     // two accent colors. the first one is its pin on the map
	about: 'Two sentences: what it is and the problem it solves.',
	mine: ['What I built.', 'Another thing I did.'], // the "what i did" bullets
	stack: ['TypeScript', 'React'],   // listed on one line under the bullets
	team: 'my team at Hack the North', // optional: shown as "built with ...". leave it out and it says "solo project"
	github: 'https://github.com/adibeldada/my-project',
	demo: 'https://my-project.vercel.app', // optional: leave it out if there's no live version
	image: '/projects/myproject.png', // optional: a screenshot (see below)
	award: '2nd place',               // optional
	status: 'in progress',            // optional: scribbled next to the name. delete it once it's done
	map: { x: -3.1, z: -2.2 },        // where its stop goes on the map (see below)
},
```

- **Order:** the order of the list is the order of the stops, on the trail and on the page. It runs oldest to newest (the trail climbs as the projects get newer, ending at the summit), so a new project usually goes at the end of the list.
- **Where it goes on the map:** run `npm run dev`, open `localhost:4321/?debug`, click the land where you want the stop, and paste what it copies (`map: { x: ..., z: ... }`). The trail curves to it on its own. Put each new stop further along the trail than the one before it. Right now there's room on the mountain between RouteScore and the summit, around `x` -2.9 to -3.3 and `z` -2.15 to -2.3. After that the summit needs to move further along: it's `SUMMIT` in `src/map/terrain.ts`.
- **If the trail cuts a strange corner** on the way to the new stop, give it bend points to pass through first: `map: { x: -3.1, z: -2.2, via: [[-2.6, -2.1]] }` (the other projects in the file have examples).
- **An image:** put the file in `public/projects/` (make the folder the first time) and set `image: '/projects/myproject.png'`. It shows on the card when the project has no live demo.
- **A live demo** (optional, more work): copy one of the files in `src/components/demos/` as a starting point, then add it to the `demos` list near the top of `src/pages/index.astro`. A project without a demo looks the same, just with its screenshot or only the text.

### adding to the 3D world

**`src/map/world.ts`** is the list of the little things on the map, each with where it goes:

```ts
export const WORLD: Placed[] = [
	{ make: me, x: -4.3, z: 2.22, turn: 0.5, size: 1.5 }, // me, waving at the trailhead
	{ make: serverRack, x: -2.42, z: 1.55, turn: 0.35 }, // by BridgeAid
	// ...
];
```

- **`x`, `z`** are the spot on the map (click the land with `?debug` to get them), **`turn`** rotates it in radians (1.57 is a quarter turn), and **`size`** scales it.
- **To make a new object**, add a function to `src/map/props.ts` that lists its parts with `build()`, then add a line for it to `WORLD` (and import it at the top of `world.ts`):

```ts
// a coffee mug next to the terminal
export function mug(): Thing {
	const object = build(
		[
			{ shape: 'cylinder', size: [0.02, 0.035], at: [0, 0.0175, 0], color: '#f4f1ea' },
			{ shape: 'torus', size: [0.009, 0.003], at: [0.022, 0.018, 0], color: '#f4f1ea' },
		],
		0.03, // a small shadow under it
	);
	return { object };
}
```

  The shapes are `box`, `sphere`, `cylinder`, `cone` and `torus` (what each `size` means is at the top of `src/map/kit.ts`). Sizes are in map units: a tree is about 0.3 tall. Mark screens and lights `glow: true` so they light up at night. For a piece that moves, build it separately and change it in `update(time)`, like the robot's head in `props.ts` or the waving arm in `me.ts`.
- **To make the map bigger**, change `WIDTH` and `DEPTH` at the top of `src/map/terrain.ts` (12 and 8 now). The ground, water, cut-away sides, trees and city lights all grow with it, and the overview camera backs up to fit. The shape of the land comes from `heightAt()` in the same file: `cliffZ()` is where the cliff runs, `SUMMIT` is the peak the trail ends on and `LEDGE` is the flat spot on the cliff for Catan, so new land carries on with the same hills.
- **Keeping it fast:**
  - Build objects with `build()`. It merges all their parts into one mesh, so even a detailed object costs the graphics card a single draw.
  - Keep it to a handful of small objects near the stops. For anything with many copies (like the trees), use one `InstancedMesh`, like `makeTrees()` in `src/map/scenery.ts`.
  - Avoid real-time shadows, big see-through surfaces, and CSS `backdrop-filter` blurs over the map. Those are the expensive things.
  - Animations in `update()` are fine: the map only draws while something moves, and it stops completely when nobody's using the page.
  - After a change, scroll through the site with `npm run dev` and check it stays smooth. On a slow computer the map drops to a cheaper quality tier to keep up.

## setting up the visitor counter

Until this is done, the counter stays hidden and nothing breaks.

```sh
npx wrangler d1 create adib-portfolio
```

Add what it prints to `wrangler.json`. The binding has to be called `DB`:

```json
"d1_databases": [
	{ "binding": "DB", "database_name": "adib-portfolio", "database_id": "PASTE_THE_ID_HERE", "migrations_dir": "migrations" }
]
```

Then create the table, once for local dev and once for the real site:

```sh
npx wrangler d1 migrations apply adib-portfolio --local
npx wrangler d1 migrations apply adib-portfolio --remote
```

## the resume pdf

The "résumé" links (top right, and in the say-hi card) download `public/Adib_ElDada_Resume.pdf`. To update your résumé, replace that file with the new PDF, keeping the same name.

## running it

```sh
npm install
npm run dev     # http://localhost:4321
npm run build
```
