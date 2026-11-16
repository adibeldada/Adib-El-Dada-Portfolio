// collects what src/scripts/track.ts sends: which sections people reach and what they click.
// it fills in roughly where they are (from cloudflare, which works it out from the ip address; the
// ip itself isn't stored) and saves it all for /stats.
// it skips bots, and me once I've logged in to /stats. until the database is set up it does nothing

import type { APIRoute } from 'astro';
import { statsEnv, isOwner, isBot, describeDevice, OWNER_COOKIE } from '../../server/stats';

export const prerender = false;

const ID = /^[a-z0-9-]{8,40}$/;
const KINDS = new Set(['page', 'section', 'click']);
const MAX_EVENTS_PER_VISIT = 500;

const text = (value: unknown, max: number) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null);
const whole = (value: unknown, min: number, max: number) => (typeof value === 'number' && Number.isFinite(value) ? Math.round(Math.min(max, Math.max(min, value))) : min);

interface Incoming {
	kind?: unknown;
	target?: unknown;
	detail?: unknown;
	section?: unknown;
	index?: unknown;
	steps?: unknown;
	ago?: unknown;
}

export const POST: APIRoute = async ({ request, locals, cookies, url }) => {
	const done = new Response(null, { status: 204 });
	const { STATS: db, STATS_PASSWORD: password } = statsEnv(locals);
	if (!db) return done;
	const ua = request.headers.get('user-agent');
	if (isBot(ua) || (await isOwner(cookies.get(OWNER_COOKIE)?.value, password))) return done;

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return new Response(null, { status: 400 });
	}
	const visit = body.visit;
	const visitor = body.visitor;
	if (typeof visit !== 'string' || typeof visitor !== 'string' || !ID.test(visit) || !ID.test(visitor)) {
		return new Response(null, { status: 400 });
	}

	const now = Date.now();
	const events = (Array.isArray(body.events) ? (body.events as Incoming[]) : [])
		.slice(0, 40)
		.filter((e) => e && KINDS.has(e.kind as string))
		.map((e) => ({
			kind: e.kind as string,
			target: text(e.target, 120),
			detail: text(e.detail, 300),
			section: text(e.section, 40),
			index: whole(e.index, 0, 100),
			steps: whole(e.steps, 0, 100),
			// the browser says how long ago it happened, so a wrong clock on their computer doesn't matter
			at: now - whole(e.ago, 0, 3600000),
		}));

	// where they came from: just the other site's domain (and nothing when it's this site)
	let referrer: string | null = null;
	try {
		const from = new URL(String(body.referrer));
		if (from.hostname !== url.hostname) referrer = from.hostname.replace(/^www\./, '').slice(0, 100);
	} catch {}

	const cf = locals.runtime?.cf;
	const statements = [
		db
			.prepare(
				`INSERT INTO visits (id, visitor, started, last_seen, active_ms, city, region, country, timezone, network, referrer, landing, device, event_count)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				 ON CONFLICT (id) DO UPDATE SET
					last_seen = excluded.last_seen,
					active_ms = active_ms + excluded.active_ms,
					event_count = event_count + excluded.event_count`,
			)
			.bind(
				visit,
				visitor,
				events.length ? Math.min(...events.map((e) => e.at)) : now,
				now,
				whole(body.active, 0, 600000),
				text(cf?.city, 80),
				text(cf?.region, 80),
				text(cf?.country, 8),
				text(cf?.timezone, 60),
				text(cf?.asOrganization, 120),
				referrer,
				text(body.landing, 150),
				describeDevice(ua!),
				events.length,
			),
	];

	// a visit stops collecting once it has a lot of events, so one tab left open can't fill the database
	for (const e of events) {
		statements.push(
			db
				.prepare(
					`INSERT INTO events (visit, at, kind, target, detail, section)
					 SELECT ?, ?, ?, ?, ?, ? WHERE (SELECT event_count FROM visits WHERE id = ?) <= ?`,
				)
				.bind(visit, e.at, e.kind, e.target, e.detail, e.section, visit, MAX_EVENTS_PER_VISIT),
		);
	}

	const furthest = events.filter((e) => e.kind === 'section').sort((a, b) => b.index - a.index)[0];
	if (furthest) {
		statements.push(
			db.prepare('UPDATE visits SET furthest = MAX(furthest, ?), steps = ? WHERE id = ?').bind(furthest.index, furthest.steps, visit),
		);
	}

	await db.batch(statements);
	return done;
};
