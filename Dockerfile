FROM node:18.15.0-alpine as front
RUN apk update
RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++
WORKDIR /usr/src/app
COPY package.json yarn.lock babel.config.cjs tsconfig.json ./
RUN SKIP_POSTINSTALL=1 yarn install
COPY configs ./configs
COPY scripts ./scripts
COPY redisinsight ./redisinsight
RUN yarn --cwd redisinsight/api
ARG SERVER_TLS_CERT
ARG SERVER_TLS_KEY
ARG SEGMENT_WRITE_KEY
ENV SERVER_TLS_CERT=${SERVER_TLS_CERT}
ENV SERVER_TLS_KEY=${SERVER_TLS_KEY}
ENV SEGMENT_WRITE_KEY=${SEGMENT_WRITE_KEY}
RUN yarn build:web
RUN yarn build:statics

FROM node:18.15.0-alpine as back
WORKDIR /usr/src/app
COPY redisinsight/api/package.json redisinsight/api/yarn.lock ./
RUN yarn install
COPY redisinsight/api ./
COPY --from=front /usr/src/app/redisinsight/api/static ./static
COPY --from=front /usr/src/app/redisinsight/api/defaults ./defaults
RUN yarn run build:prod

FROM node:18.15.0-alpine

ARG NODE_ENV=production
ARG SERVER_TLS_CERT
ARG SERVER_TLS_KEY
ARG SEGMENT_WRITE_KEY
ENV SERVER_TLS_CERT=${SERVER_TLS_CERT}
ENV SERVER_TLS_KEY=${SERVER_TLS_KEY}
ENV SEGMENT_WRITE_KEY=${SEGMENT_WRITE_KEY}
ENV NODE_ENV=${NODE_ENV}
ENV SERVER_STATIC_CONTENT=true
ENV BUILD_TYPE='DOCKER_ON_PREMISE'
WORKDIR /usr/src/app
COPY --from=back /usr/src/app/dist ./redisinsight/api/dist
COPY --from=front /usr/src/app/redisinsight/ui/dist ./redisinsight/ui/dist

# Build BE prod dependencies here to build native modules
COPY redisinsight/api/package.json redisinsight/api/yarn.lock ./redisinsight/api/
RUN yarn --cwd ./redisinsight/api install --production
COPY redisinsight/api/.yarnclean.prod ./redisinsight/api/.yarnclean
RUN yarn --cwd ./redisinsight/api autoclean --force

COPY ./docker-entry.sh ./
RUN chmod +x docker-entry.sh

EXPOSE 5000

USER node

ENTRYPOINT ["./docker-entry.sh", "node", "redisinsight/api/dist/src/main"]
