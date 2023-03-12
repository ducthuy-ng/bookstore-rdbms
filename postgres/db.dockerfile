FROM postgres:15.2

COPY . /db
WORKDIR /db
RUN chmod +x init_db.sh
RUN  ./init_db.sh
ENTRYPOINT ["sleep","infinity"]
