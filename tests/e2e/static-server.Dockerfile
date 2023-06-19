FROM node:16.15.1-alpine

WORKDIR /app

COPY package.json .
RUN yarn add express fs-extra
COPY . .

CMD ["node", "static.ts"]