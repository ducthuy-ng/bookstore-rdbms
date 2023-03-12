#!/bin/sh

# csv_file="/path/to/csv/file.csv"
# psql -h localhost -p "5432" -U postgres -d postgres


# psql -c "CREATE TEMPORARY TABLE temp_table (col1 VARCHAR, col2 INT, col3 DATE)"
# psql -c "\\COPY temp_table FROM $csv_file DELIMITER ',' CSV HEADER"
# psql -c "CREATE TABLE new_table AS SELECT * FROM temp_table WHERE 1=0"
# psql -c "DROP TABLE temp_table"