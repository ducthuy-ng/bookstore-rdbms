FROM maven:3.9.1-eclipse-temurin-11 AS builder

COPY bookstore-dbms/ /app/
WORKDIR /app
RUN mvn package

FROM ubuntu:22.04

RUN apt update && \
    apt install -y wget openjdk-11-jdk && \
    rm -rf /var/lib/apt/lists/*

RUN wget -O hbase-2.5.3-bin.tar.gz https://dlcdn.apache.org/hbase/2.5.3/hbase-2.5.3-bin.tar.gz && \
    tar xzf hbase-2.5.3-bin.tar.gz && \
    rm hbase-2.5.3-bin.tar.gz


ENV HBASE_HOME=/hbase-2.5.3
ENV PATH="${PATH}:/hbase-2.5.3/bin"

EXPOSE 8080
EXPOSE 16010

COPY ./docker/hbase-env.sh $HBASE_HOME/conf
COPY ./docker/bootstrap.hbase.sh /
COPY --from=builder /app/target/bookstore-dbms-0.0.1-SNAPSHOT.jar /app/
CMD ["/bootstrap.hbase.sh", "-s"]