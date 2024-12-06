import { LoggerService } from 'src/modules/logger/logger.service';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';

const loggerOptions: WinstonModuleOptions = {};
const mockNestLogger = {
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

const testContext = 'TestContext';
const nonErrorLevels = ['debug', 'info'];
const errorLevels = ['error', 'warn'];
const nestLoggerMethods = { debug: 'debug', info: 'log' };

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    jest.resetAllMocks();

    jest.spyOn(WinstonModule, 'createLogger').mockReturnValue(mockNestLogger);

    service = new LoggerService(loggerOptions, false, testContext);
  });

  it('should ignore startup contexts if disabled', () => {
    service = new LoggerService(loggerOptions, true, 'InstanceLoader');
    service.log('Test message');

    expect(mockNestLogger.log).not.toHaveBeenCalled();
  });

  it('should not ignore startup contexts if not disabled', () => {
    service = new LoggerService(loggerOptions, false, 'InstanceLoader');
    service.log('Test message');

    expect(mockNestLogger.log).toHaveBeenCalledTimes(1);
    expect(mockNestLogger.log).toHaveBeenCalledWith('Test message', 'InstanceLoader');
  });

  test.each(nonErrorLevels)('should add metadata to log - %s', (level) => {
    const metadata = { foo: 'bar', baz: 42 };
    service[level]('Test message', metadata);
    expect(mockNestLogger[nestLoggerMethods[level]]).toHaveBeenCalledTimes(1);
    expect(mockNestLogger[nestLoggerMethods[level]]).toHaveBeenCalledWith({
      message: 'Test message',
      context: testContext,
      ...metadata,
    });
  });

  test.each(nonErrorLevels)('should not try to add metadata to log if it doesn\'t exist - %s', (level) => {
    service[level]('Test message');
    expect(mockNestLogger[nestLoggerMethods[level]]).toHaveBeenCalledTimes(1);
    expect(mockNestLogger[nestLoggerMethods[level]]).toHaveBeenCalledWith({
      message: 'Test message',
      context: testContext,
    });
  });

  test.each(errorLevels)('should add metadata and error details to log - %s', (level) => {
    const metadata = { foo: 'bar', baz: 42 };
    const error = new Error('Test error');
    error.stack = 'test stack';
    service[level]('Test message', error, metadata);

    // assert
    expect(mockNestLogger[level]).toHaveBeenCalledTimes(1);
    expect(mockNestLogger[level]).toHaveBeenCalledWith({
      message: 'Test message',
      context: testContext,
      ...metadata,
      error: 'Test error',
    }, 'test stack');
  });

  test.each(errorLevels)('should add metadata to log when error is absent - %s', (level) => {
    const metadata = { foo: 'bar', baz: 42 };
    service[level]('Test message', metadata);

    // assert
    expect(mockNestLogger[level]).toHaveBeenCalledTimes(1);
    expect(mockNestLogger[level]).toHaveBeenCalledWith({
      message: 'Test message',
      context: testContext,
      ...metadata,
    }, undefined);
  });

  test.each(errorLevels)('should add error to log when metadata is absent - %s', (level) => {
    const error = new Error('Test error');
    error.stack = 'test stack';
    service[level]('Test message', error);

    // assert
    expect(mockNestLogger[level]).toHaveBeenCalledTimes(1);
    expect(mockNestLogger[level]).toHaveBeenCalledWith({
      message: 'Test message',
      context: testContext,
      error: 'Test error',
    }, 'test stack');
  });
});
