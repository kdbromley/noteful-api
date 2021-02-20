CREATE TABLE notes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    note_title TEXT NOT NULL,
    content TEXT,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
    folder INTEGER REFERENCES folders(id) ON DELETE CASCADE NOT NULL
);