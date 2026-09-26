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
	// who i built it with (every one of these was a team project)
	team: string;
	award?: string;
	links: { label: string; href: string }[];
	// where its stop sits on the map. x goes from -6 (left) to 6 (right), z from -4 (the back,
	// up on the mountain) to 4 (the front, by the water). easiest way to pick a spot: open
	// localhost:4321/?debug and click the map, it copies the numbers for you
	map: { x: number; z: number };
	// a screenshot in /public (like '/projects/myapp.png'), shown if the project has no live demo
	image?: string;
}

export const projects: Project[] = [
	{
		id: 'bridgeaid',
		map: { x: -2.7, z: 1.25 },
		name: 'BridgeAid',
		tagline: 'Report, verify and respond to emergencies, all in one place.',
		context: 'McMaster Engineering Competition',
		when: 'Nov 2025',
		icon: ['#2563EB', '#4FB0FF'],
		award: '4th place, programming',
		about:
			'A disaster-response platform for Hamilton: prep guides, emergency reports on a live map, aid requests and volunteer sign-ups. The problem we went after: in a crisis, information is scattered and a lot of it is wrong.',
		mine: [
			'Built the Flask backend, with JWT auth so only logged-in users can file reports.',
			'Worked on verification: a report only reaches the live map once 3 different people report the same kind of incident within 200 m, and nobody can re-report the same thing nearby for 10 minutes. An experimental Gemini cross-check sits on top.',
		],
		stack: ['React', 'Leaflet', 'Flask', 'Python', 'JWT', 'Gemini API'],
		team: 'my team at the McMaster Engineering Competition',
		links: [{ label: 'code', href: 'https://github.com/adibeldada/BridgeAid-Project' }],
	},
	{
		id: 'anattack',
		map: { x: -0.5, z: 0.75 },
		name: 'Anattack',
		tagline: 'Studying anatomy, but make it a game. In C.',
		context: 'SFWRENG 2XC3',
		when: 'Dec 2025',
		icon: ['#6446DB', '#A488FF'],
		about:
			'Anatomy is mostly memorization, so we made studying a bit of a game: flashcards that keep bringing back the ones you miss, multiple-choice quizzes, a class schedule, and a leaderboard for your class. It all saves to files, so your progress is still there next time.',
		mine: [
			'Built the leaderboard module: it reads every score from a file into dynamically allocated arrays, sorts your class, and rewrites the file when scores change.',
			'Wrote the file persistence, and led the quiz logic and the text-based UI.',
		],
		stack: ['C', 'Make', 'File I/O', 'Dynamic memory'],
		team: 'my 2XC3 group',
		links: [{ label: 'code', href: 'https://github.com/adibeldada/Anattack-Project' }],
	},
	{
		id: 'catan',
		map: { x: 1.3, z: 0.14 },
		name: 'Catan Simulator',
		tagline: 'Settlers of Catan, rebuilt around design patterns.',
		context: 'SFWRENG 2AA4',
		when: 'Jan – May 2026',
		icon: ['#E39B2D', '#F5CF63'],
		about:
			'A Java Catan simulator for our software design course, with human and rule-based AI players, undo/redo, and a live Python visualizer. The real point was clean design: every new feature came in through a pattern instead of a rewrite.',
		mine: [
			"Helped build the 40-class Java engine, including the pattern work: Command for undo/redo (two stacks), Template Method for the AI's turn, and Visitor for scoring its moves.",
			'Modeled it in UML with Papyrus, tested it with JUnit, and ran every push through a SonarCloud quality gate on GitHub Actions.',
		],
		stack: ['Java', 'Maven', 'JUnit', 'UML / Papyrus', 'GitHub Actions', 'SonarCloud'],
		team: 'Youssef Elshafei, Youssef Khafagy and Riken Allen',
		links: [{ label: 'code', href: 'https://github.com/adibeldada/Catan-Simulator' }],
	},
	{
		id: 'triageflow',
		map: { x: 3.0, z: -0.9 },
		name: 'TriageFlow',
		tagline: 'Hospital intake where you only have to tell your story once.',
		context: 'Mac-A-Thon',
		when: 'Feb 2026',
		icon: ['#FF5F6D', '#FF9A6B'],
		about:
			'Triage desks lose time asking every patient the same questions while the waiting room fills up. With TriageFlow, patients do a short guided intake on their phone first, and AI turns it into a summary staff can review in seconds. The AI only suggests. Staff always make the call.',
		mine: [
			'Built the live staff dashboard: one queue sorted by urgency, then arrival time, that refreshes every few seconds so staff always see the current order.',
			"Helped build the intake pipeline: Next.js API routes send the patient's answers to Llama 3.3 (through Groq), ask for strict JSON back, and save the summary in Postgres.",
		],
		stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Llama 3.3 via Groq', 'Tailwind', 'Docker'],
		team: 'my team at Mac-A-Thon',
		links: [
			{ label: 'live demo', href: 'https://triage-flow-nine.vercel.app' },
			{ label: 'code', href: 'https://github.com/adibeldada/TriageFlow' },
		],
	},
];

export function getProject(id: string): Project {
	const p = projects.find((p) => p.id === id);
	if (!p) throw new Error(`no project with id "${id}"`);
	return p;
}
