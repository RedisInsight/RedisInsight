FROM node:18.15.0-alpine as build

RUN apk update && apk add bash libsecret dbus-x11 gnome-keyring
RUN dbus-uuidgen > /var/lib/dbus/machine-id

WORKDIR /usr/src/app

COPY redisinsight/api/package.json redisinsight/api/yarn.lock ./

RUN yarn install

COPY redisinsight/api ./

RUN yarn run build:prod

RUN rm -rf node_modules/

RUN yarn install --production
RUN cp .yarnclean.prod .yarnclean && yarn autoclean --force

# Production image
FROM node:18.15.0-alpine as production

RUN apk update && apk add bash libsecret dbus-x11 gnome-keyring
RUN dbus-uuidgen > /var/lib/dbus/machine-id

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV RI_BUILD_TYPE='DOCKER_ON_PREMISE'

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY ./api-docker-entry.sh ./
RUN chmod +x api-docker-entry.sh

ENTRYPOINT ["./api-docker-entry.sh"]
CMD ["node", "dist/src/main"]

EXPOSE 5540

