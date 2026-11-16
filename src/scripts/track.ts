// tells /stats how people use the site: the pages they open, how far down the trail they get, and
// what they click. (the server side is src/pages/api/track.ts, and src/pages/stats.astro shows it.)
// one visit = one browser tab. a random id kept in the browser tells a returning visitor apart.
// nothing gets sent from browsers that ask not to be tracked (Global Privacy Control) or from
// automated browsers. it batches things up and sends them every few seconds, so it costs next to nothing

interface Pending {
	kind: 'page' | 'section' | 'click';
	target: string;
	detail?: string;
	section?: string;
	index?: number;
	steps?: number;
	at: number;
}

const randomId = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

function kept(store: () => Storage, key: string) {
	try {
		let value = store().getItem(key);
		if (!value) {
			value = randomId();
			store().setItem(key, value);
		}
		return value;
	} catch {
		return randomId(); // storage is blocked: still counts, just as a new visitor
	}
}

const optedOut = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true || navigator.webdriver;

if (!optedOut) {
	const visitor = kept(() => localStorage, 'stats-visitor');
	const visit = kept(() => sessionStorage, 'stats-visit');
	const queue: Pending[] = [];
	let timer = 0;

	// time the tab is actually on screen (not just open in the background)
	let activeSince = document.visibilityState === 'visible' ? performance.now() : 0;
	let active = 0;
	const takeActive = () => {
		if (activeSince) {
			const now = performance.now();
			active += now - activeSince;
			activeSince = now;
		}
		const ms = Math.round(active);
		active = 0;
		return ms;
	};

	const add = (event: Omit<Pending, 'at'>) => {
		queue.push({ ...event, at: Date.now() });
		timer ||= window.setTimeout(() => send(false), 4000);
	};

	function send(leaving: boolean) {
		clearTimeout(timer);
		timer = 0;
		const activeMs = takeActive();
		if (!queue.length && activeMs < 1000) return;
		const now = Date.now();
		const body = JSON.stringify({
			visit,
			visitor,
			referrer: document.referrer,
			landing: location.pathname + location.search,
			active: activeMs,
			events: queue.splice(0, 40).map(({ at, ...event }) => ({ ...event, ago: now - at })),
		});
		// leaving the page: sendBeacon still gets it there after the tab closes
		if (!(leaving && navigator.sendBeacon?.('/api/track', body))) {
			fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {});
		}
		if (queue.length) timer = window.setTimeout(() => send(false), 4000);
	}

	add({ kind: 'page', target: location.pathname });

	// a section counts as reached once it crosses the middle of the screen
	const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-shot]'));
	const reached = new Set<string>();
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const name = (entry.target as HTMLElement).dataset.shot!;
				if (!entry.isIntersecting || reached.has(name)) continue;
				reached.add(name);
				add({ kind: 'section', target: name, index: sections.indexOf(entry.target as HTMLElement), steps: sections.length });
			}
		},
		{ rootMargin: '-45% 0px -45% 0px' },
	);
	sections.forEach((s) => observer.observe(s));

	// links and buttons, named the way a person sees them: a data-track attribute wins, then the
	// aria-label (for icon buttons), then the text on it
	document.addEventListener(
		'click',
		(e) => {
			const el = (e.target as Element | null)?.closest?.('a, button, summary, [data-track]');
			if (!el) return;
			const name = (el.getAttribute('data-track') || el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
			add({
				kind: 'click',
				target: name || el.tagName.toLowerCase(),
				detail: el instanceof HTMLAnchorElement ? el.href : undefined,
				section: el.closest<HTMLElement>('[data-shot]')?.dataset.shot,
			});
		},
		{ capture: true, passive: true },
	);

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') {
			send(true);
			activeSince = 0;
		} else {
			activeSince = performance.now();
		}
	});
	window.addEventListener('pagehide', () => send(true));
}
