// the projects: the finished ones in the order i built them, then the ones i'm still working on
// (they're where i am now, so they sit last, right below the summit). that's also the order of the
// stops on the trail map. the id doubles as a link: adibeldada.com/#catan jumps straight to that stop

export interface Project {
	id: string;
	name: string;
	tagline: string;
	context: string;
	when: string;
	// two colors used for the project's accents (the first one is also its pin on the map)
	icon: [string, string];
	about: string;
	mine: string[];
	stack: string[];
	// who i built it with. leave it out for a solo project (the card says "solo project")
	team?: string;
	award?: string;
	// optional, for a win: a short label like '1st place'. the project then gets a gold trophy: a
	// ribbon on its card, a badge on its featured card and a trophy on its map label
	win?: string;
	// optional: scribbled next to the name, like 'in progress'
	status?: string;
	// optional, for in-progress projects: one line on what already works (keep it to what's really built)
	working?: string;
	// optional, for in-progress projects: what's planned next (shown as "next up: ..." under the bullets)
	next?: string;
	// optional: one short line of proof for its card in the featured row at the top
	highlight?: string;
	// optional: small print at the bottom of the card (like a data licence)
	note?: string;
	// the links on the card: the code, and a live version people can try (leave demo out if there isn't one)
	github: string;
	demo?: string;
	// where its stop sits on the map. x goes from -6 (left) to 6 (right), z from -4 (the back,
	// up on the mountain) to 4 (the front, by the water). easiest way to pick a spot: open
	// localhost:4321/?debug and click the map, it copies the numbers for you.
	// via (optional): extra [x, z] points the trail curves through on its way to this stop
	map: { x: number; z: number; via?: [number, number][] };
	// a screenshot in /public (like '/projects/myapp.png'), shown if the project has no live demo
	image?: string;
}

export const projects: Project[] = [
	{
		id: 'bridgeaid',
		map: { x: -2.7, z: 1.25, via: [[-4.0, 1.7], [-3.3, 1.38]] },
		name: 'BridgeAid',
		tagline: 'Report, verify and respond to emergencies, all in one place.',
		context: 'McMaster Engineering Competition',
		when: 'Nov 2025',
		icon: ['#2563EB', '#4FB0FF'],
		award: '4th place, programming',
		about:
			"A disaster-response platform for Hamilton and McMaster. The problem we went after: in a crisis, information is scattered and a lot of it is wrong. BridgeAid puts it in one place: prep guides for each kind of disaster with a quiz to test yourself, emergency reports on a live map, aid requests (food, shelter, medical help or supplies, with the urgency and household size), volunteer sign-ups with active and standby responders, and a recovery dashboard.",
		mine: [
			'Built the React frontend (Vite + Tailwind) and the live incident map (Leaflet + OpenStreetMap): the pages for preparing, reporting, requesting aid, volunteering and recovery, and the map that shows only verified incidents.',
			"The map only shows an incident once 3 different people report the same kind of emergency within 200 m (haversine distance), which cuts down false and panicked reports. Nearby confirmed reports merge into one incident instead of piling up, and the same person can't report the same thing again nearby for 10 minutes.",
			"People type an address instead of dropping a pin: it's turned into map coordinates with OpenStreetMap's Nominatim, cached so repeat lookups don't hit its rate limit, and confirmed incidents from the last 24 hours get a second check by Gemini.",
			'The Flask backend is locked down with JWT auth: passwords are stored hashed, and reporting an incident needs a signed-in user.',
		],
		stack: ['React', 'Vite', 'Tailwind', 'Leaflet', 'Flask', 'JWT', 'Gemini'],
		team: 'my team at the McMaster Engineering Competition',
		github: 'https://github.com/adibeldada/BridgeAid-Project',
	},
	{
		id: 'anattack',
		map: { x: -0.75, z: 0.78, via: [[-2.0, 1.22], [-1.4, 1.05]] },
		name: 'Anattack',
		tagline: 'Studying anatomy, but make it a game. In C.',
		context: 'SFWRENG 2XC3',
		when: 'Nov – Dec 2025',
		icon: ['#6446DB', '#A488FF'],
		about:
			"Anatomy is mostly memorization, so we made studying a bit of a game: flashcards that keep bringing back the ones you miss, multiple-choice quizzes, a class schedule, and a leaderboard for your class. It's a terminal app written in C, split into modules that each build with Make, and it all saves to files, so your progress is still there next time.",
		mine: [
			'Top contributor on a 4-person team (29 of 74 commits). I set up the project structure and wrote the login, register, deregister and leaderboard modules in C, then wired the flashcards module into the main menu.',
			"Stored scores in dynamically allocated arrays grown with realloc, saved them to a file, and bounded every scanf so input can't overflow a buffer.",
			'Made it nicer to use: every module has a --help option, menu choices work in any case, and every allocation is freed before the program exits.',
			"Wrote the Bash test script that runs the whole app through its paces (login, leaderboard, quizzes, flashcards) and returns the number of failed cases, resetting a test user's score between tests so they can't affect each other.",
		],
		stack: ['C', 'Make', 'Bash', 'GitHub Actions'],
		team: 'my 2XC3 group',
		github: 'https://github.com/adibeldada/Anattack-Project',
	},
	{
		id: 'catan',
		map: { x: 1.85, z: 0.2, via: [[0.4, 0.66], [1.2, 0.52]] },
		name: 'Catan Simulator',
		tagline: 'Settlers of Catan, rebuilt around design patterns.',
		context: 'SFWRENG 2AA4',
		when: 'Jan – Mar 2026',
		icon: ['#E39B2D', '#F5CF63'],
		about:
			'A Java Catan simulator for our software design course, with human and rule-based AI players, undo/redo, the robber, and a live Python visualizer that draws the board as the game plays out. The real point was clean design: the course added new requirements every few weeks, and every new feature came in through a design pattern instead of a rewrite.',
		mine: [
			'Top contributor on the team: 92 of the 130 commits.',
			"Implemented undo/redo with the Command pattern (two history stacks, so every human move can be undone and redone), the AI's turn with Template Method, and move scoring with Visitor.",
			'Built the link to the Python visualizer: a JSON exporter for the board, the visualizer modes, and the vertex adjacencies the board is built on.',
			'Wrote a regex command parser for human players (roll, go, list and building), implemented the robber, and made each player human or AI from config.txt.',
			'Set up the JUnit suite (40 tests, including partition and boundary cases) and SonarQube analysis in GitHub Actions, and cleaned up what it flagged, like swapping print statements for proper logging.',
		],
		stack: ['Java', 'Maven', 'JUnit', 'SonarQube', 'GitHub Actions'],
		team: 'Youssef Elshafei, Youssef Khafagy and Riken Allen',
		github: 'https://github.com/adibeldada/Catan-Simulator',
	},
	{
		id: 'triageflow',
		map: { x: 3.4, z: -1.0, via: [[2.55, 0.08], [2.9, -0.3], [2.65, -0.62]] },
		name: 'TriageFlow',
		tagline: 'Hospital intake where you only have to tell your story once.',
		context: 'Mac-A-Thon',
		when: 'Feb 2026',
		icon: ['#FF5F6D', '#FF9A6B'],
		about:
			"Triage desks lose time asking every patient the same questions while the waiting room fills up. With TriageFlow, patients open the site on their phone and do a short guided intake (designed to take under 2 minutes), and AI turns it into a structured summary with a suggested urgency and any red flags. Staff get a live queue sorted by urgency and arrival time, review the full transcript, override the urgency, add notes and mark patients ready, while patients watch their status and estimated wait. The AI only suggests. Staff always make the call.",
		mine: [
			'Built the backend: the Next.js API routes and the PostgreSQL database behind them (triage sessions and chat transcripts, with transcripts deleted along with their session), with Postgres running in Docker.',
			'Deployed it to Vercel, with the API routes rendering on every request so the staff queue (ranked by urgency, then arrival time) always shows live data.',
			'Made the database set itself up: the intake chat and the staff queue make sure the tables exist before they query, so a brand-new cloud database works on the very first request.',
		],
		stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Vercel', 'Llama 3.3 via Groq'],
		team: 'my team at Mac-A-Thon',
		github: 'https://github.com/adibeldada/TriageFlow',
		demo: 'https://triage-flow-nine.vercel.app',
	},
	{
		id: 'nova',
		map: { x: 2.0, z: -1.95, via: [[3.15, -1.62]] },
		name: 'NOVA',
		tagline: 'An offline AI copilot for astronauts. It advises, the crew decides.',
		context: 'McMaster Engineering Competition',
		when: 'Nov 2026',
		icon: ['#2B3990', '#8EA2FF'],
		award: '1st place, programming',
		win: '1st place',
		highlight: 'Won the programming category at MEC 2026 · runs fully offline on one laptop',
		about:
			"An onboard assistant for the long stretch of a space mission where there's no internet and the ground is slow to answer. It answers crew questions from NASA manuals with the page cited, watches the ship's sensors, raises alerts, and talks by voice. The LLM, the speech recognition and the voice all run on one laptop with no connection.",
		mine: [
			'Built the answer pipeline: NASA manual PDFs split into ~150-word chunks that remember their page, BM25 search over them, and Llama 3.1 8B (run locally through Ollama, temperature 0) answering only from the top 3 excerpts, citing the file and page, with the exact excerpts shown under the answer.',
			'Built the live ship status: six simulated sensors (CO2, O2, cabin pressure, cabin temperature, battery, coolant) updating every second, with CAUTION and WARNING levels decided by plain threshold checks in code, never by the LLM. A WARNING puts up a red banner and is spoken out loud, and a demo button breaks the CO2 scrubber so CO2 climbs into both.',
			'Kept it from guessing: when the best match scores under a cutoff, NOVA says it can\'t find it in the manuals instead of asking the LLM. BM25 only matches exact words, so the LLM first turns each typed question into 5 search keywords, and follow-ups like "where does it say that?" reuse the last question and answer.',
			'Gave the LLM the live sensor readings with every question, so "how\'s the cabin?" gets real numbers, an alarm pulls up the matching manual pages, and "what should I do?" still gets an answer mid-alarm instead of a refusal.',
			'Wrote the read-only rules: NOVA says it can\'t take actions when asked to, and labels every piece of advice "Suggested - crew decides".',
			'Made it talk, fully offline: speech-to-text with faster-whisper, answers read aloud with pyttsx3 in a background thread (kept under 30 words in voice mode), and a hands-free Voice tab with a "Hey Nova" wake word and an animated orb. A background mic thread ends a question after 2 seconds of silence and lets you cut NOVA off by saying "stop", without mistaking its own voice for yours.',
		],
		stack: ['Python', 'Streamlit', 'Ollama (Llama 3.1 8B)', 'BM25', 'pypdf', 'faster-whisper', 'pyttsx3', 'sounddevice'],
		team: 'my team at the McMaster Engineering Competition',
		note: "The sensors are simulated and the alert limits are demo numbers, not NASA's. The manuals are NASA technical briefs.",
		github: 'https://github.com/adibeldada/NOVA-Navigation-Onboard-Vitals-Advisor',
	},
	{
		id: 'keytrace',
		map: { x: 0.0, z: -1.95, via: [[1.0, -2.08]] },
		name: 'KeyTrace',
		tagline: 'Coding interview practice you can rewind.',
		context: 'Personal project',
		when: 'Sep 2026 – now',
		status: 'in progress',
		highlight: 'Real-time collaborative editor with session replay · v0.6.0 · 18 tests in CI',
		working:
			'Real-time shared editing in rooms you join by link, solo, interview and group modes, host-only session ending, and a replay of every session saved in PostgreSQL.',
		icon: ['#14B8A6', '#5EEAD4'],
		about:
			"A web app for practicing coding interviews. You open a room, share the link, and edit code together in a shared browser editor in real time, alone, with a friend, or with a tutor playing the interviewer. Every edit is recorded, so after the session you can replay exactly how the problem was solved, like reviewing game footage, and see where you got stuck, what you rewrote and how long each part took.",
		mine: [
			"Built the real-time core: a Spring Boot WebSocket server that relays every edit to everyone in the room, with my own message protocol (JSON with a type field) and custom close codes for a session that ended, a full room and a room that doesn't exist.",
			'Built the replay: every edit is saved as a timestamped snapshot in PostgreSQL, and the player (play/pause and a draggable timeline) finds the right moment with a binary search over the timestamps.',
			'Built the rooms: a home screen to pick solo, interview or group mode (1, 2 or up to 10 people), a random room ID you share by link, a live player count, and late joiners getting the current code the moment they arrive.',
			'Made ending a session host-only and enforced it on the server: the room creator gets a secret host token, and anyone else who tries gets an HTTP 403, not just a hidden button.',
			'Made sessions survive a restart: rooms and their recordings are stored with Spring Data JPA and loaded back when the server starts, after I split the room logic out into its own service and organized the code into packages.',
			'Wrote 18 backend tests (as of Oct 25, 2026) that run in GitHub Actions on every push: unit tests with JUnit and Mockito, and integration tests against a real PostgreSQL started by Testcontainers, including one that simulates a server restart.',
		],
		next: 'A Docker sandbox for running code and a problem panel, then accounts, interview features, and Playwright end-to-end tests with an AWS deployment.',
		stack: [
			'Java 17',
			'Spring Boot',
			'WebSockets',
			'PostgreSQL',
			'React',
			'TypeScript',
			'Monaco Editor',
			'Docker Compose',
			'JUnit',
			'Mockito',
			'Testcontainers',
			'GitHub Actions',
		],
		github: 'https://github.com/adibeldada/KeyTrace',
	},
	{
		id: 'routescore',
		map: { x: -2.0, z: -2.05 },
		name: 'RouteScore',
		tagline: "Serverless pipeline that measures how reliable Hamilton's HSR buses really are.",
		context: 'Personal project',
		when: 'Sep 2026 – now',
		status: 'in progress',
		highlight: 'Live dashboard · every HSR bus, every minute · redesigned from an est. $1,000+/month to a few dollars',
		working:
			"Collecting the city's live GTFS-Realtime feed every minute since Oct 9, 2026, working out every bus arrival each hour, and a public dashboard at routescore.adibeldada.com: the route leaderboard, any route hour by hour or on a given day, and how reliable any of the 2,353 stops is.",
		icon: ['#C13584', '#F28CCB'],
		about:
			"Every minute, a Lambda saves the City of Hamilton's live GTFS-Realtime bus feed to S3. Every hour, a second one works out when each bus actually reached each stop, compares it to the schedule, and labels it early, on time or late using the city's own rule (at most 2 minutes early or 5 late). The totals add up in DynamoDB, and a public dashboard shows the most and least reliable routes, any route hour by hour, and any stop.",
		mine: [
			'Estimated that the obvious design, writing every prediction to DynamoDB each minute (~20,000 writes a minute), would cost $1,000+ a month, so I redesigned it as an hourly batch over S3. It runs for a few dollars a month.',
			'Caught a data bug: the feed sends placeholder stops with zero times, and they were being counted as on time, inflating on-time %. I filtered them out, moved to a clean table and wrote a backfill script that recounts every saved hourly file into it.',
			"Designed a DynamoDB single-table schema for running on-time totals by route, hour and stop. Each hourly run boils ~10,000 arrivals down to ~2,300 rows and adds them with atomic ADD counters, and on-time % is worked out when it's read, since counts add up correctly over time and percentages don't.",
			'Built the public dashboard end to end: a read-only API (a Lambda behind API Gateway, throttled to 10 requests a second) for the whole city, the leaderboard, a route, a route on a given day and a stop, and a plain HTML/JavaScript site with Chart.js hour-by-hour charts, a day picker and autocomplete over all 2,353 stops, served over HTTPS from S3 through CloudFront on my own subdomain.',
			'Defined everything in AWS CDK (Python), from the Lambdas and their schedules to least-privilege IAM permissions (the API can only read the stats table), and fixed a production failure I found in CloudWatch: "total" is a DynamoDB reserved word.',
		],
		next: 'Trends over time (month by month, like fall vs. winter rush hour), then tests (pytest, moto) in GitHub Actions, ghost bus detection, email alerts when your bus is running late, and a queue between fetching and processing so one failing doesn\'t break the other.',
		stack: ['Python', 'AWS Lambda', 'EventBridge', 'S3', 'DynamoDB', 'API Gateway', 'CloudFront', 'AWS CDK', 'JavaScript', 'Chart.js', 'Docker', 'protobuf', 'boto3'],
		note: 'Contains information licensed under the Open Government Licence – City of Hamilton. Not affiliated with the City of Hamilton or HSR.',
		github: 'https://github.com/adibeldada/RouteScore',
		demo: 'https://routescore.adibeldada.com',
	},
];

// the featured row under the intro: a card for each of these, linking to its stop (by id, in this order)
export const featured = ['nova', 'keytrace', 'routescore'];

export function getProject(id: string): Project {
	const p = projects.find((p) => p.id === id);
	if (!p) throw new Error(`no project with id "${id}"`);
	return p;
}
