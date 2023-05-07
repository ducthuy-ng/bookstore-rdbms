#!/bin/bash

set -euf

start_rest() {
    sleep 15s
    hbase-daemon.sh start rest -p 8080
}

start_local_server() {
    sleep 17s
    java -jar /app/bookstore-dbms-0.0.1-SNAPSHOT.jar &
    LOCAL_SERVER_PID=$!
}

start_logging() {
    MASTER_LOG_FILE="$HBASE_HOME/logs/hbase--master-$(hostname).log"
    tail -fn +0 "$MASTER_LOG_FILE" &
    TAIL_PID=$!
}

init_db() {
    sleep 10s
    if [ -z "$HBASE_INITDB_FILE" ]; then
        return
    fi

    if [ -z "$HBASE_INIT_SCHEMA_FILE" ]; then
        return
    fi

    hbase shell -n "$HBASE_INIT_SCHEMA_FILE"
    hbase org.apache.hadoop.hbase.mapreduce.ImportTsv \
        -Dcreate.table=yes \
        -Dimporttsv.separator='|' \
        -Dimporttsv.columns=HBASE_ROW_KEY,info:basic,info:details,info:price,info:publishedYear \
        book \
        file://"$HBASE_INITDB_FILE"

}

start-hbase.sh

start_logging
start_rest
start_local_server

init_db

terminate() {
    hbase-daemon.sh stop rest
    stop-hbase.sh

    kill "$LOCAL_SERVER_PID"

    kill $TAIL_PID
    exit
}
trap 'terminate' INT TERM

wait
