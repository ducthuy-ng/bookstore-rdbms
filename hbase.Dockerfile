FROM ubuntu:22.04

RUN apt update && \
    apt install -y wget openjdk-11-jdk && \
    rm -rf /var/lib/apt/lists/*

RUN wget -O hbase-2.5.3-bin.tar.gz https://dlcdn.apache.org/hbase/2.5.3/hbase-2.5.3-bin.tar.gz && \
    tar xzf hbase-2.5.3-bin.tar.gz && \
    rm hbase-2.5.3-bin.tar.gz

# RUN wget -O phoenix-hbase-2.5-5.1.3-bin.tar.gz https://dlcdn.apache.org/phoenix/phoenix-5.1.3/phoenix-hbase-2.5-5.1.3-bin.tar.gz && \
#     tar xzf phoenix-hbase-2.5-5.1.3-bin.tar.gz && \
#     rm phoenix-hbase-2.5-5.1.3-bin.tar.gz && \
#     cp phoenix-hbase-2.5-5.1.3-bin/phoenix-server-hbase-2.5-5.1.3.jar hbase-2.5.3/lib/

ENV HBASE_HOME=/hbase-2.5.3
ENV PATH="${PATH}:/hbase-2.5.3/bin"

EXPOSE 8080
EXPOSE 16010

COPY ./docker/hbase-env.sh $HBASE_HOME/conf
COPY ./docker/bootstrap.hbase.sh /
CMD ["/bootstrap.hbase.sh"]