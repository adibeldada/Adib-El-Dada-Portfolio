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
	// optional: shown as a badge on the card, like 'in progress'
	status?: string;
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
		map: { x: -0.5, z: 0.75, via: [[-2.0, 1.22], [-1.3, 1.05]] },
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
		map: { x: 1.3, z: 0.14, via: [[0.15, 0.62], [0.8, 0.56], [0.5, 0.34], [1.05, 0.24]] },
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
		map: { x: 3.0, z: -0.9, via: [[1.8, 0.02], [2.05, -0.22], [2.55, -0.36], [2.4, -0.62]] },
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
		map: { x: 3.95, z: -1.85 },
		name: 'KeyTrace',
		tagline: 'Coding interview practice you can rewind.',
		context: 'Personal project',
		when: 'Sep 2026 – now',
		status: 'in progress',
		icon: ['#14B8A6', '#5EEAD4'],
		about:
			'A web app for practicing coding interviews. You solve a problem in a shared code editor in the browser, alone or with a friend or tutor playing the interviewer. The idea: every keystroke gets recorded, so afterwards you can replay the session and see where you got stuck, what you rewrote and how long each part took, like athletes reviewing game footage.',
		mine: [
			'Built the real-time core: a Spring Boot backend where each session is a room with its own random ID, and a WebSocket handler relays every edit to everyone else in that room.',
			"Built the React + TypeScript frontend around the Monaco editor (the one inside VS Code). The room keeps its latest code, so anyone who joins late sees it right away.",
			'Next up: recording every keystroke with timestamps, replaying sessions with play, pause and scrubbing, and running code in sandboxed Docker containers.',
		],
		stack: ['Java', 'Spring Boot', 'WebSockets', 'React', 'TypeScript', 'Monaco Editor'],
		github: 'https://github.com/adibeldada/KeyTrace',
	},
];

export function getProject(id: string): Project {
	const p = projects.find((p) => p.id === id);
	if (!p) throw new Error(`no project with id "${id}"`);
	return p;
}
