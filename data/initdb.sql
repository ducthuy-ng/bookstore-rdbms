CREATE TABLE book (
    isbn VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    num_of_page INT,
    authors VARCHAR NOT NULL,
    published_year INT,
    cover_url VARCHAR,
    sell_price INT
);
COPY book
FROM '/docker-entrypoint-initdb.d/data.csv' WITH (FORMAT csv);

-- CREATE EXTENSION pg_trgm;
-- CREATE INDEX book_name_idx ON book USING GIN (name gin_trgm_ops);
-- SET pg_trgm.similarity_threshold = 0.15;
