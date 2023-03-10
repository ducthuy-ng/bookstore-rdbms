FROM ubuntu:22.04

RUN apt update && \
    apt install -y wget openjdk-11-jdk && \
    rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-arm64

RUN wget -O hbase-2.5.3-bin.tar.gz https://dlcdn.apache.org/hbase/2.5.3/hbase-2.5.3-bin.tar.gz && \
    tar xzf hbase-2.5.3-bin.tar.gz

ENV HBASE_HOME=/hbase-2.5.3
ENV PATH="${PATH}:/hbase-2.5.3/bin"

EXPOSE 8080
EXPOSE 16010

COPY ./docker/bootstrap.hbase.sh /
CMD ["/bootstrap.hbase.sh"]