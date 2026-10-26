// the projects, in the order i built them. that's also the order of the stops on the
// trail map. the id doubles as a link: adibeldada.com/#catan jumps straight to that stop

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
			'A disaster-response platform for Hamilton: prep guides, emergency reports on a live map, aid requests and volunteer sign-ups. The problem we went after: in a crisis, information is scattered and a lot of it is wrong.',
		mine: [
			'Built the React frontend and the live incident map (Leaflet + OpenStreetMap).',
			'The map only shows an incident once 3 different people report it within 200 m (haversine distance), which cuts down false reports. The Flask backend is locked down with JWT auth.',
		],
		stack: ['React', 'Leaflet', 'Flask', 'JWT'],
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
			'Anatomy is mostly memorization, so we made studying a bit of a game: flashcards that keep bringing back the ones you miss, multiple-choice quizzes, a class schedule, and a leaderboard for your class. It all saves to files, so your progress is still there next time.',
		mine: [
			'Top contributor on a 4-person team (29 of 74 commits). I wrote the login/register and leaderboard modules in C.',
			"Stored scores in dynamically allocated arrays grown with realloc, saved them to a file, and bounded every scanf so input can't overflow a buffer.",
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
			'A Java Catan simulator for our software design course, with human and rule-based AI players, undo/redo, and a live Python visualizer. The real point was clean design: every new feature came in through a pattern instead of a rewrite.',
		mine: [
			'Top contributor on the team: 90 of the 128 commits.',
			"Implemented undo/redo with the Command pattern (two history stacks), the AI's turn with Template Method, and move scoring with Visitor.",
			'Wrote a regex command parser and set up the JUnit suite (40 tests, including edge cases), with SonarQube analysis running in GitHub Actions.',
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
			'Triage desks lose time asking every patient the same questions while the waiting room fills up. With TriageFlow, patients do a short guided intake on their phone first, and AI turns it into a summary staff can review in seconds. The AI only suggests. Staff always make the call.',
		mine: [
			'Built the backend: the Next.js API routes and the PostgreSQL database behind them (triage sessions, chat transcripts), with Postgres running in Docker.',
			'Deployed it to Vercel, with the API routes rendering on every request so the staff queue (ranked by urgency, then arrival time) always shows live data.',
		],
		stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Vercel', 'Llama 3.3 via Groq'],
		team: 'my team at Mac-A-Thon',
		github: 'https://github.com/adibeldada/TriageFlow',
		demo: 'https://triage-flow-nine.vercel.app',
	},
	{
		id: 'keytrace',
		map: { x: 0.0, z: -1.95, via: [[3.1, -1.65], [1.8, -1.9]] },
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
			'A web app for practicing coding interviews. People edit code together in a shared browser editor in real time, every edit is recorded, and after the session you can replay how the problem was solved, like reviewing game footage. Rooms come in solo, interview and group modes.',
		mine: [
			"Built the real-time core: a Spring Boot WebSocket server that relays every edit to everyone in the room, with my own message protocol (JSON with a type field) and custom close codes for a session that ended, a full room and a room that doesn't exist.",
			'Built the replay: every edit is saved as a timestamped snapshot in PostgreSQL, and the player (play/pause and a draggable timeline) finds the right moment with a binary search over the timestamps.',
			'Made ending a session host-only and enforced it on the server: the room creator gets a secret host token, and anyone else who tries gets an HTTP 403, not just a hidden button.',
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
		highlight: 'Tracks every HSR bus every minute · redesigned from an est. $1,000+/month to a few dollars',
		working:
			"Collecting the city's live GTFS-Realtime feed every minute since Oct 9, 2026, working out every bus arrival each hour, and keeping on-time totals by route, hour and stop in DynamoDB.",
		icon: ['#C13584', '#F28CCB'],
		about:
			"Every minute, a Lambda saves the City of Hamilton's live GTFS-Realtime bus feed to S3. Every hour, a second one works out when each bus actually reached each stop, compares it to the schedule, and labels it early, on time or late using the city's own rule (at most 2 minutes early or 5 late). The totals add up in DynamoDB, and a reporting script turns them into a leaderboard of the best and worst routes.",
		mine: [
			'Estimated that the obvious design, writing every prediction to DynamoDB each minute (~20,000 writes a minute), would cost $1,000+ a month, so I redesigned it as an hourly batch over S3. It runs for a few dollars a month.',
			'Caught a data bug: the feed sends placeholder stops with zero times, and they were being counted as on time, inflating on-time %. I filtered them out, moved to a clean table and wrote a backfill script that recounts every saved hourly file into it.',
			"Designed a DynamoDB single-table schema for running on-time totals by route, hour and stop. Each hourly run boils ~10,000 arrivals down to ~2,300 rows and adds them with atomic ADD counters, and on-time % is worked out when it's read, since counts add up correctly over time and percentages don't.",
			'Defined everything in AWS CDK (Python), from both Lambdas and their schedules to least-privilege IAM permissions, and fixed a production failure I found in CloudWatch: "total" is a DynamoDB reserved word.',
		],
		next: 'Finishing the backfill so the stats cover every hour since Oct 15, then tests (pytest, moto) in GitHub Actions, CloudWatch alarms, feed outage detection, a public dashboard and ghost bus detection.',
		stack: ['Python', 'AWS Lambda', 'EventBridge', 'S3', 'DynamoDB', 'AWS CDK', 'Docker', 'protobuf', 'boto3'],
		note: 'Contains information licensed under the Open Government Licence – City of Hamilton. Not affiliated with the City of Hamilton or HSR.',
		github: 'https://github.com/adibeldada/RouteScore',
	},
];

// the featured row under the intro: a card for each of these, linking to its stop (by id, in this order)
export const featured = ['keytrace', 'routescore', 'triageflow'];

export function getProject(id: string): Project {
	const p = projects.find((p) => p.id === id);
	if (!p) throw new Error(`no project with id "${id}"`);
	return p;
}
