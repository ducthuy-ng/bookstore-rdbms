FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=nonitnteractive

RUN apt update && \
    apt install -y postgresql && \
    rm -rf /var/lib/apt/lists/* 


ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

EXPOSE 5432
EXPOSE 5050

COPY ./docker/bootstrap.postgres.sh /
CMD ["/bootstrap.postgres.sh"]