FROM node:latest

WORKDIR /app

COPY package.json .
RUN yarn add express fs-extra
COPY . .

CMD ["node", "static.ts"]