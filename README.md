# RedisInsight

[![CircleCI](https://circleci.com/gh/RedisInsight/RedisInsight/tree/master.svg?style=svg)](https://circleci.com/gh/RedisInsight/RedisInsight/tree/master)

Awesome Redis GUI written in Electron, NodeJS and React

## Directory Structure

- `redisinsight/ui` - Contains the frontend code
- `redisinsight/api` - Contains the backend code
- `docs` - Contains the documentation
- `scripts` - Build scripts and other build-related files
- `configs` - Webpack configuration files and other build-related files
- `tests` - Contains the e2e

## Plugins documentation

* [Introduction](docs/plugins/introduction.md)
* [Installation and Usage](docs/plugins/installation.md)
* [Plugin Development](docs/plugins/development.md)

## Prerequisites

Make sure you have installed following packages:
* [Node](https://nodejs.org/en/download/) >=14.x and <16
* [yarn](https://www.npmjs.com/package/yarn) >=1.21.3

## Installation

Before development or build you have to install required dependencies

```bash
$ yarn install
$ yarn --cwd redisinsight/api/
```

## Development

There are 2 ways to develop:

### Developing using electron app

After you have installed all dependencies you can now run the app.
Run `yarn start` to start an electron application that will watch and build for you.

```bash
# Development
$ yarn start
```

### Developing using web

#### Running backend part of the app

Run `yarn --cwd redisinsight/api/ start:dev` to start a local API at `localhost:5000`.

```bash
# Development
$ yarn --cwd redisinsight/api/ start:dev
```

While the API is running, open your browser and navigate to http://localhost:5000/api/docs. You should see the Swagger UI.

#### Running frontend part of the app

Run `yarn start:web` to start a local server for UI.

```bash
# Development
$ yarn start:web
```

Web interface will be available at http://localhost:8080

Now servers will watch for changes and automatically build for you

## Build

### Packaging the desktop app

#### Building statics for enablement area and default plugins

Run `yarn build:statics` or `yarn build:statics:win` for Windows

After you have installed all dependencies you can package the app.
Run `yarn package:prod` to package app for the local platform:

```bash
# Production
$ yarn package:prod
```

And packaged installer will be in the folder _./release_

### Create docker image

There are 2 different docker images available

- Image with API and UI
- Image with API only

#### Build Docker image with UI

```bash
  docker build .
```

Image exposes 5000 port

Api docs - /api/docs

Main UI - /

Example:

```bash
  docker build -t redisinsight .
```

```bash
  docker run -p 5000:5000 -d --cap-add ipc_lock redisinsight
```

Then api docs and main ui should be available on http://localhost:5000/api/docs and http://localhost:5000

#### Build Docker with API only

Image exposes 5000 port

Api docs - /api/docs

Example:

```bash
  docker build -f api.Dockerfile -t api.redisinsight .
```

```bash
  docker run -p 5000:5000 -d --cap-add ipc_lock api.redisinsight
```

Then api docs and main ui should be available on http://localhost:5000/api/docs

## Tests

### Running frontend tests

#### Run UI unit tests 

```bash
  yarn test
```

### Running backend tests

#### Run backend unit tests

```bash
  # Plain tests
  yarn --cwd redisinsight/api test
  
  # Tests with coverage
  yarn --cwd redisinsight/api test:cov
```

### Run backend integration tests (using local server)

```bash
  # Plain tests
  yarn --cwd redisinsight/api test:api
  
  # Tests with coverage
  yarn --cwd redisinsight/api test:api:cov
```

> **_NOTE_**: Using `yarn test:api*` scripts you should have redis server up and running.  
By default tests will look on `localhost:6379` without any auth  
To customize tests configs you should run test with proper environment variables

Example:

If you have redis server running on a different host or port `somehost:7777` with default user pass `somepass`

You should run test commands with such environment variables

```bash
  # Plain tests
  TEST_REDIS_HOST=somehost \ 
  TEST_REDIS_PORT=7777 \
  TEST_REDIS_PASSWORD-somepass \
  yarn --cwd redisinsight/api test:api
```

You can find all possible environment variable available in the [constants.ts](redisinsight/api/test/helpers/constants.ts) file

### Run backend integration tests (using docker)

Here you should not care about tests and local redis database configuration

We will spin up server inside docker container and run tests over it

```bash
  # run this this command
  ./redisinsight/api/test/test-runs/start-test-run.sh -r oss-st-6
```
- -r - is the Redis Test Environment name

We are supporting several test environments to run tests on various Redis databases:
- **oss-st-5**            - _OSS Standalone v5_
- **oss-st-5-pass**       - _OSS Standalone v5 with admin pass required_
- **oss-st-6**            - _OSS Standalone v6 and all modules_
- **oss-st-6-tls**        - _OSS Standalone v6 with TLS enabled_
- **oss-st-6-tls-auth**   - _OSS Standalone v6 with TLS auth required_
- **oss-clu**             - _OSS Cluster_
- **oss-clu-tls**         - _OSS Cluster with TLS enabled_
- **oss-sent**            - _OSS Sentinel_
- **re-st**               - _Redis Enterprise with Standalone inside_
- **re-clu**              - _Redis Enterprise with Cluster inside_


### Running E2E tests

Install E2E tests deps

```bash
  yarn --cwd tests/e2e 
```

Run E2E tests

```bash
  yarn --cwd tests/e2e test:chrome
```
