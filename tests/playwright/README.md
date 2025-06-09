## Description

Playwright tests project for Redisinsight

## Preconditions for running locally

Note: this relies on docker RTE and RI images and configs from the tests/e2e project

1. spin up the Redis test environment container from tests/e2e/ project:
```shell 
  docker compose -p test-docker -f ../e2e/rte.docker-compose.yml up --force-recreate —detach
```
2. for the Docker RI build:

- build the image locally or trigger a [GitHub action](https://github.com/RedisInsight/RedisInsight/actions/workflows/manual-build.yml) to do so and download the artifact (docker-linux-alpine.amd64.tar)
- load the image 
```shell 
  docker load -i docker-linux-alpine.amd64.tar
```
- compose a container `docker compose -p e2e-ri-docker -f ../e2e/docker.web.docker-compose.yml up --detach --force-recreate`
  - Note: you need RI_ENCRYPTION_KEY, RI_SERVER_TLS_CERT, RI_SERVER_TLS_KEY environment variables for this step (in tests/e2e/.env)
- once running you should be able to access the app on https://localhost:5540

3. for Electron RI build:

- build from root project `shell package:prod`. This creates a /release folder.
- change `ELECTRON_EXECUTABLE_PATH` in tests/playwright/env/.desktop.env to point to the executable file (MacOS by default)

4. for local web build:

- make sure the Docker RI build container from step 2. is stopped as the api shares the same port (5540)
- start `shell dev:ui` and `shell dev:api` from the root project
- once running you should be able to access the app on http://localhost:8080

## Install

```shell
  yarn install
```

Install Playwright browsers

```shell
  yarn playwright install
```

Install Playwright operating system dependencies requires sudo / root

```shell
  sudo yarn playwright install-deps
```

[More info on running tests](https://playwright.dev/docs/running-tests)

## Extra tooling

Auto-generate tests with Codegen.

```shell
  yarn playwright codegen
```

Starts the interactive UI mode. This also can be set in the config.

```shell
  yarn playwright test --ui
```

## Running tests

Runs the end-to-end tests for the Docker RI build in Chromium browser (also runs in CI):

```shell
  yarn test:chromium:docker
```

Runs the end-to-end tests for the Docker RI build in Chromium browser in debug mode:

```shell
  yarn test:chromium:docker:debug
```

Runs the end-to-end tests for the Docker RI build in Chromium browser for a specific .spec file:

```shell
  yarn yarn test:chromium:docker basic-navigation
```

Runs the end-to-end tests for the Electron RI build.

```shell
  yarn test:electron
```

Runs the end-to-end tests for the local web environment (client:8080, api:5540).

```shell
  yarn test:chromium:local-web
```

## Reports

Allure report display needs JAVA_HOME set  
and to run the server, JDK version 8 to 11 is required.

Running e2e tests will generate HTML and Allure reports. However, those reports are for a single run. In order to have history, which is more useful, run:

```shell
yarn test:allureHistoryReport
```

Or change it depending on your needs to enable history for the report that can show you around 20 executions. Additional info can be  
added to this report. For more information, see: https://allurereport.org/docs/playwright-reference/

Some rough execution time comparison for the same test:

| Test Name                         | Framework  | Browser  | Duration |
| --------------------------------- | ---------- | -------- | -------- |
| Verify that user can add Hash Key | TestCafe   | Chromium | 27s      |
| Verify that user can add Hash Key | PlayWright | Chromium | 10s      |
| Verify that user can add Hash Key | TestCafe   | Eelctron | 30s      |
| Verify that user can add Hash Key | PlayWright | Eelctron | 18s      |
