// the server side of the visitor stats (/stats and /api/track). it runs on the cloudflare worker.
// the data lives in the STATS database, and the /stats password is the STATS_PASSWORD secret.
// both get set up with wrangler (README: "visitor stats"), so the password is never in the code

export interface StatsEnv {
	STATS?: D1Database;
	STATS_PASSWORD?: string;
}

export const statsEnv = (locals: App.Locals) => (locals.runtime?.env ?? {}) as StatsEnv;

// the cookie that says "this is me": it keeps me logged in to /stats, and my own visits aren't counted
export const OWNER_COOKIE = 'stats_owner';
export const OWNER_DAYS = 30;

const encoder = new TextEncoder();

async function hmac(key: string, message: string) {
	const k = await crypto.subtle.importKey('raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
	return new Uint8Array(await crypto.subtle.sign('HMAC', k, encoder.encode(message)));
}

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

// compares every byte, so how long it takes doesn't give away how much matched
function same(a: Uint8Array, b: Uint8Array) {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

export async function passwordMatches(given: string, real: string) {
	// both go through the same hash first, so they're the same length whatever was typed
	const [a, b] = await Promise.all([hmac('stats-login', given), hmac('stats-login', real)]);
	return same(a, b);
}

// the cookie is "<expiry>.<signature>". only someone with the password can make the signature, so it
// can't be faked, and changing the password logs every old cookie out
export async function makeOwnerCookie(password: string) {
	const expires = Date.now() + OWNER_DAYS * 86400000;
	return `${expires}.${hex(await hmac(password, `owner:${expires}`))}`;
}

export async function isOwner(cookie: string | undefined, password: string | undefined) {
	if (!cookie || !password) return false;
	const [expires, signature] = cookie.split('.');
	if (!signature || !(Number(expires) > Date.now())) return false;
	return same(encoder.encode(signature), encoder.encode(hex(await hmac(password, `owner:${expires}`))));
}

/* ---------- slowing down password guessing ---------- */

const WINDOW = 15 * 60000;

// a scrambled version of the ip, so wrong tries can be counted per person without storing the ip
export async function whoIs(request: Request) {
	return hex(await hmac('stats-ip', request.headers.get('cf-connecting-ip') ?? 'local')).slice(0, 32);
}

// 8 wrong passwords from one place, or 40 from anywhere, in 15 minutes: no more tries for a while
export async function loginBlocked(db: D1Database, who: string) {
	const row = await db
		.prepare('SELECT COUNT(*) AS everyone, COALESCE(SUM(who = ?), 0) AS mine FROM login_failures WHERE at > ?')
		.bind(who, Date.now() - WINDOW)
		.first<{ everyone: number; mine: number }>();
	return (row?.mine ?? 0) >= 8 || (row?.everyone ?? 0) >= 40;
}

export async function noteFailure(db: D1Database, who: string) {
	await db.batch([
		db.prepare('INSERT INTO login_failures (who, at) VALUES (?, ?)').bind(who, Date.now()),
		db.prepare('DELETE FROM login_failures WHERE at < ?').bind(Date.now() - 86400000),
	]);
}

/* ---------- who's visiting ---------- */

// search engines, link previews (linkedin, slack...), uptime checkers and scripts. not people
export const isBot = (ua: string | null) =>
	!ua || /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|curl|wget|python|node-fetch|axios|go-http|java\//i.test(ua);

export function describeDevice(ua: string) {
	const os = /iPhone/.test(ua)
		? 'iPhone'
		: /iPad/.test(ua)
			? 'iPad'
			: /Android/.test(ua)
				? 'Android'
				: /Windows/.test(ua)
					? 'Windows'
					: /CrOS/.test(ua)
						? 'ChromeOS'
						: /Mac OS X/.test(ua)
							? 'Mac'
							: /Linux/.test(ua)
								? 'Linux'
								: 'unknown';
	const browser = /Edg\//.test(ua)
		? 'Edge'
		: /OPR\//.test(ua)
			? 'Opera'
			: /Firefox\//.test(ua)
				? 'Firefox'
				: /Chrome\//.test(ua)
					? 'Chrome'
					: /Safari\//.test(ua)
						? 'Safari'
						: 'browser';
	return `${browser} on ${os}`;
}
