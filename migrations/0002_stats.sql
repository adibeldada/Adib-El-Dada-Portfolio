-- the visitor stats behind /stats (see README: "visitor stats").
-- a visit is one browser tab on the site. events are what happened during it

CREATE TABLE IF NOT EXISTS visits (
	id TEXT PRIMARY KEY, -- random, made by the browser for this tab
	visitor TEXT NOT NULL, -- random, kept by the browser, so the same person coming back has the same one
	started INTEGER NOT NULL, -- milliseconds since 1970 (utc)
	last_seen INTEGER NOT NULL,
	active_ms INTEGER NOT NULL DEFAULT 0, -- time the tab was actually on screen
	-- roughly where they are, from cloudflare (worked out from the ip address, which isn't stored)
	city TEXT,
	region TEXT,
	country TEXT,
	timezone TEXT,
	network TEXT, -- who runs their internet connection: an ISP, a university, sometimes a company
	referrer TEXT, -- the site they came from (just its domain)
	landing TEXT, -- the address they arrived at, with anything like ?ref=resume on the end
	device TEXT,
	furthest INTEGER NOT NULL DEFAULT 0, -- the furthest section they reached (0 = the intro)
	steps INTEGER NOT NULL DEFAULT 0, -- how many sections the page had then
	event_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS visits_started ON visits (started);
CREATE INDEX IF NOT EXISTS visits_visitor ON visits (visitor);

CREATE TABLE IF NOT EXISTS events (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	visit TEXT NOT NULL,
	at INTEGER NOT NULL,
	kind TEXT NOT NULL, -- page (opened a page), section (scrolled to it), click
	target TEXT, -- the page, the section, or the text of what was clicked
	detail TEXT, -- for links: where it goes
	section TEXT -- the section a click happened in
);
CREATE INDEX IF NOT EXISTS events_visit ON events (visit, at);
CREATE INDEX IF NOT EXISTS events_at ON events (at, kind);

-- wrong /stats passwords, to slow down anyone guessing. "who" is a scrambled ip, not the ip itself
CREATE TABLE IF NOT EXISTS login_failures (
	who TEXT NOT NULL,
	at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS login_failures_at ON login_failures (at);
