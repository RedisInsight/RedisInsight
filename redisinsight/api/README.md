# RedisInsight API

## Description
RedisInsight provides an intuitive and efficient GUI for Redis, allowing you to interact with your databases and manage your data—with built-in support for most popular Redis modules. It provides tools to analyze the memory, profile the performance of your database usage, and guide you toward better Redis usage.

## Prerequisites 

Make sure you have installed following packages:
* [Node](https://nodejs.org/en/download/) >= 8.0
* [npm](https://www.npmjs.com/get-npm) >= 5 

## Dependencies used
* [NestJS](https://nestjs.com/)

## Getting started

### Installation

```bash
$ yarn install
```

### Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

### Formatting

Formatting required before submitting pull request.

Prints the filenames of files that are different from Prettier formatting
```bash
$ yarn format
```
### Swagger OpenApi

The [OpenAPI](https://swagger.io/specification/) specification is a language-agnostic definition format used
to describe RESTful APIs.

While the application is running, open your browser and navigate to `http://localhost[:<port>]/api/docs`.
You should see the Swagger UI.

### Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
