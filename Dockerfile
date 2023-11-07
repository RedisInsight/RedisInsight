FROM node:18.15.0-alpine as build
RUN apk update
RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++ \
        net-tools
WORKDIR /usr/src/app
COPY package.json yarn.lock babel.config.cjs tsconfig.json ./
RUN SKIP_POSTINSTALL=1 yarn install
COPY configs ./configs
COPY scripts ./scripts
COPY redisinsight ./redisinsight
RUN yarn --cwd redisinsight/api install
ARG SERVER_TLS_CERT
ARG SERVER_TLS_KEY
ARG SEGMENT_WRITE_KEY
ENV SERVER_TLS_CERT=${SERVER_TLS_CERT}
ENV SERVER_TLS_KEY=${SERVER_TLS_KEY}
ENV SEGMENT_WRITE_KEY=${SEGMENT_WRITE_KEY}
RUN yarn build:web
RUN yarn build:statics
RUN yarn build:prod
RUN yarn --cwd ./redisinsight/api install --production
COPY ./redisinsight/api/.yarnclean.prod ./redisinsight/api/.yarnclean
RUN yarn --cwd ./redisinsight/api autoclean --force

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
COPY --from=build /usr/src/app/redisinsight/api/dist ./redisinsight/api/dist
COPY --from=build /usr/src/app/redisinsight/api/node_modules ./redisinsight/api/node_modules
COPY --from=build /usr/src/app/redisinsight/ui/dist ./redisinsight/ui/dist

COPY ./docker-entry.sh ./
RUN chmod +x docker-entry.sh

EXPOSE 5000

USER node

ENTRYPOINT ["./docker-entry.sh", "node", "redisinsight/api/dist/src/main"]
