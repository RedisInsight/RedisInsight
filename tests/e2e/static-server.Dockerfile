FROM node:20.15.0-alpine

WORKDIR /app

COPY package.json .
RUN yarn add express fs-extra
COPY . .

CMD ["node", "static.ts"]
