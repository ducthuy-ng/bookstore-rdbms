#!/bin/bash

set -euf

su - postgres
psql
DROP TABLE IF EXISTS bookstore;
CREATE TABLE IF NOT EXISTS bookstore (
    ISBN INTEGER PRIMARY KEY
);