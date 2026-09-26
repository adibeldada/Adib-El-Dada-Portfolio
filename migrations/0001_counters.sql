-- the visitor counter table. one row per counter (right now just "visitors")
CREATE TABLE IF NOT EXISTS counters (
	name TEXT PRIMARY KEY,
	value INTEGER NOT NULL DEFAULT 0
);
