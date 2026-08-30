CREATE INDEX IF NOT EXISTS notes_search_gin
ON notes USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, '')));
