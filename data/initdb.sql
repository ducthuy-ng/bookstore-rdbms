CREATE TABLE book (
    isbn CHAR(255) PRIMARY KEY,
    name CHAR(255) NOT NULL,
    numofpage INT,
    authors CHAR(255) NOT NULL,
    published_year INT,
    coverUrl CHAR(255),
    sellPrice INT
);
COPY book
FROM '/docker-entrypoint-initdb.d/data.csv' WITH (FORMAT csv);