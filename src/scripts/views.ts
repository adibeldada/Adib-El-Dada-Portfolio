// visitor counter (the server side is src/pages/api/views.ts).
// the first time someone visits we bump the count and remember their number,
// after that we only read it, so refreshing doesn't inflate anything.

const KEY = 'visitor-number';

export interface Views {
	total: number;
	mine: number;
	returning: boolean;
}

export async function loadViews(): Promise<Views | null> {
	let mine: string | null = null;
	try {
		mine = localStorage.getItem(KEY);
	} catch {}

	const res = await fetch('/api/views', { method: mine ? 'GET' : 'POST' });
	if (!res.ok) return null;
	const { count } = (await res.json()) as { count: number | null };
	if (typeof count !== 'number') return null; // database isn't set up yet

	if (!mine) {
		try {
			localStorage.setItem(KEY, String(count));
		} catch {}
	}
	return { total: count, mine: mine ? Number(mine) : count, returning: mine !== null };
}
