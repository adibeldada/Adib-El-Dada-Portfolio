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
			"A website to help Hamilton and McMaster during emergencies like wildfires, floods and storms. In a crisis, information is scattered and a lot of it is wrong, so we put it all in one place: guides on how to prepare (with a quiz to test yourself), a live map of emergencies people report, a way to ask for food, shelter, medical help or supplies (with how urgent it is and how many people are in the household), volunteer sign-ups, and a page that tracks recovery.",
		mine: [
			"Built the website people use (React, Vite and Tailwind): the pages for preparing, reporting, asking for aid, volunteering and recovery, plus the live map (Leaflet + OpenStreetMap) that only shows emergencies that have been checked.",
			"To stop fake or panicked reports, an emergency only shows up once 3 different people report the same kind within 200 m of each other. Reports close together get merged into one, and the same person can't report the same thing again nearby for 10 minutes.",
			"People type an address instead of dropping a pin, and it gets turned into a spot on the map (with OpenStreetMap's Nominatim, saving past lookups so it doesn't hit the service's limit). Emergencies confirmed in the last 24 hours also get double-checked by Gemini, an AI model.",
			"Accounts are protected: logins use JWT, passwords are stored hashed, and you have to be signed in to report an emergency (Flask backend).",
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
			"Anatomy is mostly memorizing, so we turned studying into a bit of a game: flashcards that keep bringing back the ones you get wrong, multiple-choice quizzes, a class schedule, and a leaderboard for your class. It runs in the terminal, it's written in C, and it saves everything to files so your progress is still there next time.",
		mine: [
			"Set up how the project was organized and wrote the login, sign-up, account removal and leaderboard parts in C, then connected the flashcards to the main menu.",
			"Kept it from crashing on bad input: scores live in lists that grow as needed (realloc) and get saved to a file, and every text input has a limit so long input can't overflow memory.",
			"Made it easier to use: every part has a --help option, menu choices work in upper or lower case, and all memory is freed when the app closes.",
			"Wrote the test script (Bash) that runs through login, the leaderboard, quizzes and flashcards and counts how many checks fail, resetting a test user between checks so one test can't affect another.",
		],
		stack: ['C', 'Make', 'Bash', 'GitHub Actions'],
		team: 'my 2XC3 group',
		github: 'https://github.com/adibeldada/Anattack-Project',
	},
	{
		id: 'catan',
		map: { x: 1.85, z: 0.2, via: [[0.4, 0.66], [1.2, 0.52]] },
		name: 'Catan Simulator',
		tagline: "The board game Catan, rebuilt in Java around design patterns.",
		context: 'SFWRENG 2AA4',
		when: 'Jan – Mar 2026',
		icon: ['#E39B2D', '#F5CF63'],
		about:
			"Catan as a Java program for our software design course, with human and computer players, undo and redo, the robber, and a Python window that draws the board as the game is played. The real point was clean design: the course added new requirements every few weeks, and we added each one with a design pattern instead of rewriting the code.",
		mine: [
			"Made undo and redo work with the Command pattern (two stacks of moves, so any human move can be undone and redone), and built the computer player's turn with Template Method and its move scoring with Visitor.",
			"Connected the game to the Python board viewer: exported the board as JSON, added the viewer's modes, and mapped out which corners of the board connect.",
			"Wrote the parser that reads what players type (roll, go, list and building, using regex), added the robber, and made each player human or computer from a config file.",
			"Set up 40 automated tests (JUnit, including edge cases) and code-quality checks (SonarQube) that run on GitHub Actions, and fixed what they flagged, like replacing print statements with proper logging.",
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
			"In the ER, staff lose time asking every patient the same questions while the waiting room fills up. With TriageFlow, patients fill in a short guided check-in on their phone (made to take under 2 minutes), and AI turns it into a summary with a suggested urgency and anything worrying. Staff see one live list sorted by urgency and arrival time, read the full answers, change the urgency, add notes and mark people ready, while patients can see their status and estimated wait. The AI only suggests. Staff always make the call.",
		mine: [
			"Built the backend: the Next.js API and the PostgreSQL database behind it, which stores each check-in and its chat (deleting one deletes both), with the database running in Docker.",
			"Put it online with Vercel and made the staff list load fresh data every time, so it always shows who's waiting right now (most urgent first, then who came first).",
			"Made the database set itself up: the check-in chat and the staff list create the tables if they're missing, so a brand-new database works on the very first visit.",
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
		tagline: "An AI assistant for astronauts that works with no internet. It gives advice, the crew decides.",
		context: 'McMaster Engineering Competition',
		when: 'Nov 2026',
		icon: ['#2B3990', '#8EA2FF'],
		award: '1st place, programming',
		win: '1st place',
		highlight: "We won the programming category at MEC 2026 · works with no internet, on one laptop",
		about:
			"An assistant for astronauts during the long part of a mission when there's no internet and help from Earth is slow. It answers questions from NASA manuals and shows the page each answer came from, watches the ship's sensors, warns the crew when something's wrong, and talks out loud. All of it runs on one laptop with no connection.",
		mine: [
			"We made it answer from NASA manuals only: the PDFs are split into small pieces (about 150 words) that remember their page, the best 3 matches are found with a keyword search (BM25), and a local AI model (Llama 3.1 8B through Ollama, set to not get creative) answers from just those, showing the file, the page and the exact text it used.",
			"We built the live ship status: six pretend sensors (CO2, oxygen, cabin pressure, cabin temperature, battery and coolant) that update every second. Simple rules in the code, never the AI, decide when something is a CAUTION or a WARNING. A WARNING shows a red banner and is said out loud, and a demo button breaks the CO2 scrubber so you can watch CO2 climb.",
			"We kept it from guessing: if nothing in the manuals matches well enough, it says it can't find it instead of making something up. The search only matches exact words, so the AI first turns each typed question into 5 search words, and follow-ups like \"where does it say that?\" remember the last question and answer.",
			"The AI gets the live sensor readings with every question, so \"how's the cabin?\" gets real numbers, an alarm brings up the matching manual pages, and \"what should I do?\" still gets an answer during an alarm.",
			"It can't touch the ship: if you ask it to do something, it says it can't, and every piece of advice is labelled \"Suggested - crew decides\".",
			"It talks with no internet too: it turns speech into text (faster-whisper), reads answers out loud (pyttsx3, under 30 words in voice mode), and has a hands-free mode with a \"Hey Nova\" wake word. It stops listening after 2 seconds of quiet, and you can cut it off by saying \"stop\" without it mistaking its own voice for yours.",
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
		highlight: "Code together live, then replay the session · v0.6.0 · 18 tests in CI",
		working:
			"Live shared editing in rooms you join with a link, solo, interview and group modes, only the host can end a session, and every session is saved so you can replay it.",
		icon: ['#14B8A6', '#5EEAD4'],
		about:
			"My friends were getting tired of grinding LeetCode alone and slacking off, so I built a way to practise together. You open a room, share the link, and write code together in your browser in real time, alone, with a friend, or with someone playing the interviewer. Every edit is recorded, so after the session you can replay exactly how you solved it, kind of like how soccer players rewatch their games to see where they messed up.",
		mine: [
			"Built the live editing: a Spring Boot server that sends every edit to everyone in the room over WebSockets, with my own message format (JSON with a type field) and clear error codes when a session has ended, the room is full, or the room doesn't exist.",
			"Built the replay: every edit is saved with its time in PostgreSQL, and the player (play, pause and a timeline you can drag) jumps to the right moment with a binary search over those times.",
			"Built the rooms: pick solo, interview or group (1, 2 or up to 10 people), get a random room code to share as a link, see how many people are in, and anyone who joins late gets the current code right away.",
			"Only the host can end a session, and the server checks it: whoever makes the room gets a secret host token, and anyone else who tries gets turned away (HTTP 403), not just shown a hidden button.",
			"Sessions survive a restart: rooms and their recordings are saved in the database (Spring Data JPA) and loaded back when the server starts. To get there, I split the room logic into its own service and tidied the code into packages.",
			"Wrote 18 backend tests (as of Oct 25, 2026) that run on GitHub Actions every time I push: unit tests (JUnit and Mockito) and tests against a real PostgreSQL database (Testcontainers), including one that fakes a server restart.",
		],
		next: "A safe sandbox to run code in (Docker) and a panel of practice problems, then accounts, interview features, and end-to-end tests (Playwright) before putting it on AWS.",
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
		tagline: "Tracks how reliable Hamilton's HSR buses really are, every bus, every minute.",
		context: 'Personal project',
		when: 'Sep 2026 – now',
		status: 'in progress',
		highlight: 'Live dashboard · every HSR bus, every minute · redesigned from an est. $1,000+/month to a few dollars',
		working:
			"Saving the city's live bus data (GTFS-Realtime) every minute since Oct 9, 2026, working out every bus arrival each hour, and a public dashboard at routescore.adibeldada.com: routes ranked from best to worst, any route hour by hour or on a given day, and how reliable each of the 2,353 stops is.",
		icon: ['#C13584', '#F28CCB'],
		about:
			"My friends kept getting to class late because the bus never showed up on time, and I wanted to see how bad it actually was. Every minute, RouteScore saves the City of Hamilton's live bus data. Every hour, it works out when each bus actually reached each stop and checks it against the schedule, using the city's own rule for on time (no more than 2 minutes early or 5 minutes late). A public dashboard shows the most and least reliable routes, any route hour by hour, and any stop.",
		mine: [
			"Worked out that the obvious design (writing every bus prediction to the database each minute, about 20,000 writes a minute) would cost over $1,000 a month, so I changed it to save the raw data (S3) and process it once an hour. Now it costs a few dollars a month.",
			"Caught a data bug: the feed sends placeholder stops with zero times, and they were being counted as on time, making buses look better than they were. I filtered them out, moved to a clean table, and wrote a script that recounts every saved hour into it.",
			"Designed how the totals are stored (one DynamoDB table): each hourly run turns about 10,000 arrivals into about 2,300 running counts by route, hour and stop. The on-time % is worked out when you look at it, because counts add up correctly over time and percentages don't.",
			"Built the public dashboard: a read-only API (AWS Lambda and API Gateway, limited to 10 requests a second) and a simple website with hour-by-hour charts (Chart.js), a day picker and search over all 2,353 stops, served over HTTPS from S3 and CloudFront on my own subdomain.",
			"Set everything up as code with AWS CDK (Python), giving each piece only the permissions it needs (the API can only read the stats), and fixed a live failure I found in the logs (CloudWatch): \"total\" is a reserved word in DynamoDB.",
		],
		next: "Trends month by month (like fall vs. winter rush hour), then automated tests (pytest, moto) on GitHub Actions, spotting buses that never showed up, email alerts when your bus is running late, and a queue between collecting and processing so one breaking doesn't break the other.",
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
