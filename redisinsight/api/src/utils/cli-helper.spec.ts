import ERROR_MESSAGES from 'src/constants/error-messages';
import { CommandParsingError, RedirectionParsingError } from 'src/modules/cli/constants/errors';
import {
  mockRedisAskError,
  mockRedisMovedError,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
} from 'src/__mocks__';
import {
  checkHumanReadableCommands,
  splitCliCommandLine,
  getBlockingCommands,
  checkRedirectionError,
  parseRedirectionError, getRedisPipelineSummary,
} from 'src/utils/cli-helper';

describe('Cli helper', () => {
  describe('splitCliCommandLine', () => {
    it('should correctly split simple command with args', () => {
      const input = 'memory usage key';

      const output = splitCliCommandLine(input);

      expect(output).toEqual(['memory', 'usage', 'key']);
    });
    it('should correctly split command with special symbols in the args in the double quotes', () => {
      const input = 'set test "—"';

      const output = splitCliCommandLine(input);
      const buffer = Buffer.from('e28094', 'hex');
      expect(output).toEqual(['set', 'test', buffer]);
    });
    // todo: enable after review splitCliCommandLine functionality
    xit('should correctly split command with special symbols in the args in the single quotes', () => {
      const input = "set test '—'";

      const output = splitCliCommandLine(input);

      const buffer = Buffer.from('e28094', 'hex');
      expect(output).toEqual(['set', 'test', buffer]);
    });
    it('should correctly split simple command without args', () => {
      const input = 'info';

      const output = splitCliCommandLine(input);

      expect(output).toEqual(['info']);
    });
    it('should correctly split command with double quotes', () => {
      const input = 'get "key name"';

      const output = splitCliCommandLine(input);
      expect(output).toEqual(['get', Buffer.from('key name')]);
    });
    it('should correctly split command with single quotes', () => {
      const input = "get 'key name'";

      const output = splitCliCommandLine(input);

      expect(output).toEqual(['get', 'key name']);
    });
    it('should correctly handle special character', () => {
      const input = 'set key "\\a\\b\\t\\n\\r"';
      const output = splitCliCommandLine(input);

      expect(output).toEqual([
        'set',
        'key',
        Buffer.alloc(5, String.fromCharCode(7, 8, 9, 10, 13)),
      ]);
    });
    it('should correctly handle hexadecimal', () => {
      const input = 'set key "\\xac\\xed"';
      const output = splitCliCommandLine(input);

      expect(output).toEqual(['set', 'key', Buffer.from([172, 237])]);
    });
    it('should throw [CLI_INVALID_QUOTES_CLOSING] error for command with double quotes', () => {
      const input = 'get "key"a';

      try {
        splitCliCommandLine(input);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(CommandParsingError);
        expect(err.message).toEqual(
          ERROR_MESSAGES.CLI_INVALID_QUOTES_CLOSING(),
        );
      }
    });
    it('should throw [CLI_UNTERMINATED_QUOTES] error for command with double quotes', () => {
      const input = 'get "\\\\key';

      try {
        splitCliCommandLine(input);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(CommandParsingError);
        expect(err.message).toEqual(ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES());
      }
    });
    it('should throw [CLI_INVALID_QUOTES_CLOSING] error for command with single quotes', () => {
      const input = "get 'key'a";

      try {
        splitCliCommandLine(input);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(CommandParsingError);
        expect(err.message).toEqual(
          ERROR_MESSAGES.CLI_INVALID_QUOTES_CLOSING(),
        );
      }
    });
    it('should throw [CLI_UNTERMINATED_QUOTES] error for command with single quotes', () => {
      const input = "get 'key";

      try {
        splitCliCommandLine(input);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(CommandParsingError);
        expect(err.message).toEqual(ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES());
      }
    });
  });

  describe('checkHumanReadableCommands', () => {
    const tests = [
      { input: 'info', output: true },
      { input: 'info server', output: true },
      { input: 'lolwut', output: true },
      { input: 'LOLWUT', output: true },
      { input: 'debug hstats', output: true },
      { input: 'debug hstats-key', output: true },
      { input: 'DEBUG HSTATS-KEY', output: true },
      { input: 'memory doctor', output: true },
      { input: 'memory malloc-stats', output: true },
      { input: 'cluster nodes', output: true },
      { input: 'cluster info', output: true },
      { input: 'client list', output: true },
      { input: 'latency graph', output: true },
      { input: 'latency doctor', output: true },
      { input: 'proxy info', output: true },
      { input: 'PROXY INFO', output: true },
      { input: 'get key', output: false },
      { input: 'debug object', output: false },
      { input: 'DEBUG OBJECT', output: false },
      { input: 'client kill', output: false },
      { input: 'scan 0 COUNT 15 MATCH *', output: false },
    ];
    tests.forEach((test) => {
      it(`should be output: ${test.output} for input: ${test.input} `, async () => {
        const result = checkHumanReadableCommands(test.input);

        expect(result).toEqual(test.output);
      });
    });
  });

  describe('getBlockingCommands', () => {
    it('should return fixed predefined list of blocking commands', () => {
      expect(getBlockingCommands()).toEqual([
        'blpop',
        'brpop',
        'blmove',
        'brpoplpush',
        'bzpopmin',
        'bzpopmax',
        'xread',
        'xreadgroup',
      ]);
    });
  });

  describe('checkRedirectionError', () => {
    const tests: Record<string, any>[] = [
      { input: mockRedisAskError, output: true },
      { input: mockRedisMovedError, output: true },
      { input: mockRedisNoPermError, output: false },
      { input: mockRedisWrongTypeError, output: false },
      { input: 'info', output: false },
      { input: undefined, output: false },
      { input: false, output: false },
      { input: null, output: false },
      { input: {}, output: false },
    ];
    tests.forEach((test) => {
      it(`should be output: ${test.output} for input: ${test.input} `, async () => {
        expect(checkRedirectionError(test.input)).toEqual(test.output);
      });
    });
  });

  describe('parseRedirectionError', () => {
    it('should get slot and address from MOVED error', () => {
      const result = parseRedirectionError(mockRedisMovedError);

      expect(result).toEqual({
        slot: '7008',
        address: '127.0.0.1:7002',
      });
    });
    it('should get slot and address from ASK error', () => {
      const result = parseRedirectionError({
        ...mockRedisAskError,
        message: 'ASK 7008 redis.cloud.redislabs.com:17182',
      });

      expect(result).toEqual({
        slot: '7008',
        address: 'redis.cloud.redislabs.com:17182',
      });
    });
    it('should throw exception for wrong node address', () => {
      const redirectionError = {
        ...mockRedisAskError,
        message: 'ASK 7008 redis.cloud.redislabs.com/test',
      };
      expect(() => parseRedirectionError(redirectionError)).toThrow(RedirectionParsingError);
    });
    it('should throw exception for incorrect redirection message format', () => {
      const redirectionError = {
        ...mockRedisAskError,
        message: 'ASK redis.cloud.redislabs.com:17182 7008',
      };
      expect(() => parseRedirectionError(redirectionError)).toThrow(RedirectionParsingError);
    });
    it('should throw exception', () => {
      const input: any = 'ASK redis.cloud.redislabs.com:17182 7008';
      expect(() => parseRedirectionError(input)).toThrow(RedirectionParsingError);
    });
  });

  describe('getRedisPipelineSummary', () => {
    const pipeline = Array(50).fill(['get', 'foo']);
    const tests: Record<string, any>[] = [
      {
        input: { pipeline, limit: undefined },
        output: {
          length: pipeline.length,
          summary: JSON.stringify([...Array(5).fill('get'), '...']),
        },
      },
      {
        input: { pipeline, limit: 10 },
        output: {
          length: pipeline.length,
          summary: JSON.stringify([...Array(10).fill('get'), '...']),
        },
      },
      {
        input: { pipeline, limit: 1000 },
        output: {
          length: pipeline.length,
          summary: JSON.stringify([...Array(50).fill('get')]),
        },
      },
      {
        input: { pipeline: {}, limit: 1000 },
        output: {
          length: 0,
          summary: '[]',
        },
      },
      {
        input: { pipeline, limit: -10 },
        output: {
          length: pipeline.length,
          summary: JSON.stringify(['...']),
        },
      },
    ];
    tests.forEach((test) => {
      it(`should be output: ${JSON.stringify(test.output)} for input: ${JSON.stringify(test.input)} `, async () => {
        expect(getRedisPipelineSummary(test.input.pipeline, test.input.limit)).toEqual(test.output);
      });
    });
  });
});
