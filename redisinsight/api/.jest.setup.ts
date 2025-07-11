import 'reflect-metadata';
import { Logger } from '@nestjs/common';

// Workaround for @Type test coverage
jest.mock('class-transformer', () => {
  return {
    ...(jest.requireActual('class-transformer') as Object),
    Type: (f: Function) =>
      f() && jest.requireActual('class-transformer').Type(f),
  };
});

beforeAll(() => {
  // Disable NestJS logger during tests
  jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});
