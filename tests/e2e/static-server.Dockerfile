FROM node:latest

USER root

WORKDIR /usr/src/app

COPY ./rte/remote /remote

CMD ["npm", "start"]
