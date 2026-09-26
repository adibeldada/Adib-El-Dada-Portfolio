# adibeldada.com

My portfolio is a 3D trail map. It's a floating slice of land (loosely Hamilton and the Niagara Escarpment) with a trail climbing up it, and every stop on the trail is a project I built with a team. Scroll down the page and the camera walks the trail stop by stop, and each project's card slides in next to its stop, with a small live demo that runs the same logic as the real project. The summit is the "about me".

Built with Astro, TypeScript, Three.js and plain CSS, hosted on Cloudflare Workers.

## how it works

- **The page is normal HTML.** `src/pages/index.astro` has one `<section>` per step: the intro, one per project, the summit (about me), and contact. Each has a `data-shot` saying which stop it belongs to.
- **The map is fixed behind the page.** `src/map/` builds the 3D scene with Three.js. The ground comes from one height function (`heightAt` in `terrain.ts`), and everything else sits on top of it: the trail, the pins, the trees.
- **Scrolling drives the camera.** `src/scripts/trail-progress.ts` turns the scroll position into one number (0 = intro, 1 = first stop, 1.5 = halfway to the second...). Every frame, the map reads that number, blends between the two closest camera "shots" (`camera.ts`), and fills in the trail up to where you are.
- **Clicking a stop** on the map (or on the bar at the bottom) is just a link to that section, so the browser scrolls there and the camera follows.
- **Dark mode** swaps the page's CSS variables, and the map fades between its day and night colors (`palette.ts`): contour lines start glowing and the city lights come on.
- **The visitor counter** is the only server code: `src/pages/api/views.ts` runs on a Cloudflare Worker and keeps the count in a D1 database.

### staying smooth on slow computers

The map adapts to the computer it's running on (`src/map/quality.ts` and the frame loop in `src/map/index.ts`):

- **It only draws when something moves.** Scrolling or moving the mouse gets up to 60 frames a second, sitting still drops to 20–30 (just enough to keep the water shimmering), and after 8 seconds without any input it stops drawing completely until you scroll or move again.
- **It lowers its own resolution** if frames start arriving slowly, a step at a time.
- **Low power mode:** if it still can't keep up at the lowest resolution, it stops gliding and draws just one frame each time you reach a stop.
- **No graphics acceleration:** it skips the 3D map entirely and shows a plain version of the page with the same content and demos.
- **No backdrop blur** over the map. Blurring what's behind a card means redoing the blur every time the map redraws, which is one of the most expensive things a browser can do.

Measured on the production build, with a simulated weak laptop (no graphics acceleration and a CPU slowed to a quarter speed): about 16 fps while scrolling before these changes, about 60 fps after.

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
    terrain.ts           the ground: hills, the cliff, water, the cut-away sides
    trail.ts             the stops and the route the path takes
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
```

## adding a project

1. **The data:** add it to `src/data/projects.ts` in the order it happened (the list order is the trail order). `map: { x, z }` is where its stop sits. To pick a spot, open `localhost:4321/?debug` and click the land, and it copies the numbers for you.
2. **The route:** put its id in `ROUTE` in `src/map/trail.ts`, in the same spot. If you forget, the browser console tells you.
3. **A live demo (optional):** make one in `src/components/demos/` and add it to `demos` in `src/pages/index.astro`. Without one, the card shows the project's `image` screenshot, or just the text.

Its pin, label, card, camera shot and step on the bottom bar all show up on their own.

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

Drop it into `public/` as `Adib_ElDada_Resume.pdf` and the résumé links show up automatically.

## running it

```sh
npm install
npm run dev     # http://localhost:4321
npm run build
```
