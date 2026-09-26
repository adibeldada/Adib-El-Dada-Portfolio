// the visitor counter. this is the only part of the site that runs on a server:
// it's a cloudflare worker talking to a D1 database (basically sqlite in the cloud).
//   GET  /api/views -> { count }            just read it
//   POST /api/views -> { count }            add one, return the new total
// until the database is set up (see README), it returns { count: null } and the
// site hides the counter instead of breaking.

import type { APIRoute } from 'astro';

export const prerender = false; // run on every request instead of being built into a static file

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
	});
}

function database(locals: App.Locals) {
	// DB only exists once the binding is added to wrangler.json
	return (locals.runtime?.env as { DB?: D1Database } | undefined)?.DB;
}

export const GET: APIRoute = async ({ locals }) => {
	const db = database(locals);
	if (!db) return json({ count: null });
	const row = await db.prepare('SELECT value FROM counters WHERE name = ?').bind('visitors').first<{ value: number }>();
	return json({ count: row?.value ?? 0 });
};

export const POST: APIRoute = async ({ locals }) => {
	const db = database(locals);
	if (!db) return json({ count: null });
	// one statement, so two people visiting at the same moment can't both read 41 and write 42
	const row = await db
		.prepare(
			`INSERT INTO counters (name, value) VALUES (?, 1)
			 ON CONFLICT(name) DO UPDATE SET value = value + 1
			 RETURNING value`,
		)
		.bind('visitors')
		.first<{ value: number }>();
	return json({ count: row?.value ?? null });
};
