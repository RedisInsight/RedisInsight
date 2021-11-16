# RedisInsight

[![CircleCI](https://circleci.com/gh/RedisInsight/RedisInsight/tree/master.svg?style=svg)](https://circleci.com/gh/RedisInsight/RedisInsight/tree/master)

Awesome Redis GUI written in Electron, NodeJS and React

## Directory Structure

- `redisinsight/ui` - Contains the frontend code.
- `redisinsight/api` - Contains the backend code.
- `scripts` - Build scripts and other build-related files
- `configs` - Webpack configuration files and other build-related files
- `tests` - Contains the e2e and integration tests.

## Development Workflow

### Installation

```bash
$ yarn install
$ yarn --cwd redisinsight/api/
```

### Packaging the desktop app

After you have installed all dependencies you can package the app.
Run `yarn package:prod` to package app for the local platform:

```bash
# Production
$ yarn package:prod
```

And packaged installer will be in the folder _release_

### Running the desktop app

After you have installed all dependencies you can now run the app.
Run `yarn start` to start an electron application that will watch and build for you.

```bash
# Development
$ yarn start
```

### Running frontend part of the app

After you have installed all dependencies you can now run the app.
Run `yarn start:web` to start a local server that will watch and build for you.

```bash
# Development
$ yarn start:web
```

### Running backend part of the app

After you have installed all dependencies run `yarn --cwd redisinsight/api/ start:dev` to start a local API at `localhost:5000`.

```bash
# Development
$ yarn --cwd redisinsight/api/ start:dev
```

While the API is running, open your browser and navigate to http://localhost:5000/api/docs. You should see the Swagger UI.

### Building frontend part of the app

Run `yarn build:web` to build fronted to `/redisinsight/ui/dist/`.

## Docker

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

Then api docs and main ui should be available on http://localhost/api/docs and http://localhost

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

Then api docs and main ui should be available on http://localhost/api/docs

## Continuous Integration

## Related Repositories

## Running e2e tests in root tests/e2e

- To run E2E tests run command:

```bash
  yarn test-chrome
```
