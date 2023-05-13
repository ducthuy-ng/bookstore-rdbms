#!/bin/bash

set -euf

LOCAL_SERVER_PID=-1

start_local_server() {
    sleep 15s
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
        -Dimporttsv.columns=HBASE_ROW_KEY,info:name,info:pageNum,info:authors,info:publishedYear,info:coverUrl,info:price,info:queryCol \
        book \
        file://"$HBASE_INITDB_FILE"
}

start-hbase.sh

start_logging
while getopts "s" OPTION; do
    case "$OPTION" in
    s)
        echo "Start local server"
        start_local_server
        ;;
    *) ;;
    esac
done

init_db

terminate() {
    stop-hbase.sh

    if [ "$LOCAL_SERVER_PID" != "-1" ]; then
        kill "$LOCAL_SERVER_PID"
    fi

    kill $TAIL_PID
    exit
}
trap 'terminate' INT TERM

wait
