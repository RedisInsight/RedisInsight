FROM testcafe/testcafe

USER root

WORKDIR /usr/src/app

RUN apk add --no-cache bash curl

COPY package.json yarn.lock ./

RUN npx yarn

COPY . .

RUN chmod +x wait-for-it.sh
RUN chmod +x upload-custom-plugins.sh

ENTRYPOINT ["npx", "yarn", "test:chrome:ci"]
