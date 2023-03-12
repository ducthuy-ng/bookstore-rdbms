CREATE TABLE
    Test (a INT PRIMARY KEY, b INT);

COPY Test
FROM
    '/docker-entrypoint-initdb.d/test.csv'
WITH
    (FORMAT csv);