# RedisInsight Playwright Tests

This project contains Playwright tests for RedisInsight.
It supports running tests on Electron, Docker and Web Redisinsight builds.

## Folder structure

- `/env` - contains env configs for the 3 types of builds.
- `/tests` - Contains the actual tests.
- `/helpers/api` - ported some api helpers from the tests/e2e project. They are used for setting up data.
- `/pageObjects` - ported page element locators and logic from the tests/e2e project.

## Prerequisites

### General Requirements

- Docker installed and running.
- Redis test environment and RedisInsight configurations from the `tests/e2e` project.

### Steps to Set Up

1. **Start the Redis Test Environment**  
   Navigate to the `tests/e2e` directory and run:

   ```shell
   docker compose -p test-docker -f rte.docker-compose.yml up --force-recreate --detach
   ```

2. **For Docker RI Build**

   - Build the Docker image locally or trigger a [GitHub Action](https://github.com/RedisInsight/RedisInsight/actions/workflows/manual-build.yml) to build and download the artifact (`docker-linux-alpine.amd64.tar`).
   - Load the image:
     ```shell
     docker load -i docker-linux-alpine.amd64.tar
     ```
   - Ensure the following environment variables are set in `tests/e2e/.env`:
     - `RI_ENCRYPTION_KEY`
     - `RI_SERVER_TLS_CERT`
     - `RI_SERVER_TLS_KEY`
   - Navigate to the `tests/e2e` directory and start the container:
     ```shell
     docker compose -p e2e-ri-docker -f docker.web.docker-compose.yml up --detach --force-recreate
     ```
   - Access the app at: `https://localhost:5540`.

3. **For Electron RI Build**

   - Build the project from the root directory:
     ```shell
     yarn package:prod
     ```
   - Update `ELECTRON_EXECUTABLE_PATH` in `tests/playwright/env/.desktop.env` to point to the generated executable file (MacOS by default).

4. **For Local Web Build**
   - Stop the Docker RI container from step 2 (to free up port 5540).
   - Start the UI and API servers:
     ```shell
     yarn dev:ui
     yarn dev:api
     ```
   - Access the app at: `http://localhost:8080`.

## Installation

1. Install dependencies:

   ```shell
   yarn install
   ```

2. Install Playwright browsers:

   ```shell
   yarn playwright install
   ```

3. Install Playwright OS dependencies (requires `sudo`):
   ```shell
   sudo yarn playwright install-deps
   ```

For more details, refer to the [Playwright documentation](https://playwright.dev/docs/running-tests).

## Running Tests

_Note: Make sure to run the commands bellow from the `e2e/playwright` directory._

### Docker RI Build

Run end-to-end tests in Chromium:

```shell
yarn test:chromium:docker
```

Run tests in debug mode:

```shell
yarn test:chromium:docker:debug
```

Run tests for a specific `.spec` file:

```shell
yarn test:chromium:docker basic-navigation
```

### Electron RI Build

Run end-to-end tests for the Electron build:

```shell
yarn test:electron
```

### Local Web Environment

Run tests for the local web environment:

```shell
yarn test:chromium:local-web
```

## Extra Tooling

### Auto-Generate Tests

Use Playwright's Codegen to auto-generate tests:

```shell
yarn playwright codegen
```

### Interactive UI Mode

Start Playwright's interactive UI mode:

```shell
yarn playwright test --ui
```

## Reports

### Allure Reports

- Ensure `JAVA_HOME` is set and JDK version 8 to 11 is installed.
- Generate a report with history:
  ```shell
  yarn test:allureHistoryReport
  ```
- For more details, refer to the [Allure documentation](https://allurereport.org/docs/playwright-reference/).

### Execution Time Comparison

| Test Name                         | Framework  | Browser  | Duration |
| --------------------------------- | ---------- | -------- | -------- |
| Verify that user can add Hash Key | TestCafe   | Chromium | 27s      |
| Verify that user can add Hash Key | Playwright | Chromium | 10s      |
| Verify that user can add Hash Key | TestCafe   | Electron | 30s      |
| Verify that user can add Hash Key | Playwright | Electron | 18s      |

## Code Coverage

### Overview

The Playwright tests can collect code coverage for the React frontend application. This helps track which parts of the UI code are being exercised by the end-to-end tests.

### Quick Start

# Start the UI with instrumentation for collecting code coverage

Ensure UI app is running with `COLLECT_COVERAGE=true` env variable, or simply run the following helper from the root folder

```shell
yarn dev:ui:coverage
```

# Run tests with coverage and generate both text and HTML reports

```shell
cd tests/playwright
yarn test:coverage
```

### Coverage Reports Location

After running coverage tests, reports are generated in:

- **HTML Report**: `tests/playwright/coverage/index.html` - Interactive, browsable coverage report
- **LCOV Report**: `tests/playwright/coverage/lcov.info` - For CI/CD integration
