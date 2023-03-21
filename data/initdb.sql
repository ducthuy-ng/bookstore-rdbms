CREATE TABLE book (
    isbn BIGINT PRIMARY KEY,
    name CHAR(255),
    numofpage INT,
    authors CHAR(255),
    published_year INT,
    coverUrl CHAR(255),
    sellPrice INT
);
COPY book
FROM '/docker-entrypoint-initdb.d/data.csv' WITH (FORMAT csv);