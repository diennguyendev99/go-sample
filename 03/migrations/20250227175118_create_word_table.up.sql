CREATE TABLE IF NOT EXISTS word (
    id BIGSERIAL PRIMARY KEY,
    lang VARCHAR(2) NOT NULL,
    content TEXT NOT NULL,
    translate TEXT NOT NULL
);