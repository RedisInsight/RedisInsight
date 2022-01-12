import { take, isEmpty } from 'lodash';
import config from 'src/utils/config';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CliParsingError, RedirectionParsingError } from 'src/modules/cli/constants/errors';
import { ReplyError } from 'src/models';
import { IRedirectionInfo } from 'src/modules/cli/services/cli-business/output-formatter/output-formatter.interface';

const REDIS_CLI_CONFIG = config.get('redis_cli');
const LOGGER_CONFIG = config.get('logger');
const BLANK_LINE_REGEX = /^\s*\n/gm;

export enum CliToolUnsupportedCommands {
  Monitor = 'monitor',
  Subscribe = 'subscribe',
  PSubscribe = 'psubscribe',
  Sync = 'sync',
  PSync = 'psync',
  ScriptDebug = 'script debug',
}

export enum CliToolBlockingCommands {
  BLPop = 'blpop',
  BRPop = 'brpop',
  BLMove = 'blmove',
  BRPopLPush = 'brpoplpush',
  BZPopMin = 'bzpopmin',
  BZPopMax = 'bzpopmax',
  XRead = 'xread',
  XReadGroup = 'xreadgroup',
}

export enum CliToolHumanReadableCommands {
  Info = 'info',
  Lolwut = 'lolwut',
  DebugHStats = 'debug hstats',
  DebugHStatsKey = 'debug hstats-key',
  MemoryDoctor = 'memory doctor',
  MemoryMallocStats = 'memory malloc-stats',
  ClusterNodes = 'cluster nodes',
  ClusterInfo = 'cluster info',
  ClientList = 'client list',
  LatencyGraph = 'latency graph',
  LatencyDoctor = 'latency doctor',
  ProxyInfo = 'proxy info',
}

function isHex(str: string) {
  return /^[A-F0-9]{1,2}$/i.test(str);
}

function getSpecChar(str: string): string {
  let char;
  switch (str) {
    case 'a':
      char = String.fromCharCode(7);
      break;
    case 'b':
      char = String.fromCharCode(8);
      break;
    case 't':
      char = String.fromCharCode(9);
      break;
    case 'n':
      char = String.fromCharCode(10);
      break;
    case 'r':
      char = String.fromCharCode(13);
      break;
    default:
      char = str;
  }
  return char;
}

// todo: review/rewrite this function. Pay attention on handling data inside '' vs ""
// todo: rethink implementation. set key {value} where {value} is string ~500KB take ~15s
export const splitCliCommandLine = (line: string): string[] => {
  // Splits a command line into a list of arguments.
  // Ported from sdssplitargs() function in sds.c from Redis source code.
  // This is the function redis-cli uses to parse command lines.
  let i = 0;
  let currentArg = null;
  const args = [];
  while (i < line.length) {
    /* skip blanks */
    while (line[i] === ' ') i += 1;
    let inq = false; /* set to True if we are in "quotes" */
    let insq = false; /* set to True if we are in 'single quotes' */
    let done = false;
    while (!done) {
      if (inq) {
        // Handle double quotes
        if (i >= line.length) {
          // unterminated quotes
          throw new CliParsingError(ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES());
        } else if (
          line[i] === '\\'
          && line[i + 1] === 'x'
          && isHex(`${line[i + 2]}${line[i + 3]}`)
        ) {
          const charCode = parseInt(`0x${line[i + 2]}${line[i + 3]}`, 16);
          currentArg = Buffer.concat([
            currentArg,
            Buffer.alloc(1, charCode, 'binary'),
          ]);
          i += 3;
        } else if (line[i] === '\\' && i < line.length) {
          // Handle special characters
          i += 1;
          const c = getSpecChar(line[i]);
          currentArg = Buffer.concat([
            currentArg,
            Buffer.alloc(1, c, 'binary'),
          ]);
        } else if (line[i] === '"') {
          // closing quote must be followed by a space or nothing at all.
          if (i + 1 < line.length && line[i + 1] !== ' ') {
            throw new CliParsingError(
              ERROR_MESSAGES.CLI_INVALID_QUOTES_CLOSING(),
            );
          }
          done = true;
        } else {
          currentArg = Buffer.concat([
            currentArg,
            Buffer.from(line[i], 'utf8'),
          ]);
        }
      } else if (insq) {
        // Handle single quotes
        if (i >= line.length) {
          // unterminated quotes
          throw new CliParsingError(ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES());
        } else if (line[i] === '\\' && line[i + 1] === "'") {
          i += 1;
          currentArg += "'";
        } else if (line[i] === "'") {
          // closing quote must be followed by a space or nothing at all.
          if (i + 1 < line.length && line[i + 1] !== ' ') {
            throw new CliParsingError(
              ERROR_MESSAGES.CLI_INVALID_QUOTES_CLOSING(),
            );
          }
          done = true;
        } else {
          currentArg = `${currentArg}${line[i]}`;
        }
      } else if (i >= line.length) {
        done = true;
      } else if ([' ', '\n', '\r', '\t', '\0'].includes(line[i])) {
        done = true;
      } else if (line[i] === '"') {
        currentArg = Buffer.alloc(0);
        inq = true;
      } else if (line[i] === "'") {
        currentArg = '';
        insq = true;
      } else {
        currentArg = `${currentArg || ''}${line[i]}`;
      }
      if (i < line.length) i += 1;
    }
    args.push(currentArg);
    currentArg = null;
  }
  return args;
};

export const getUnsupportedCommands = (): string[] => [
  ...Object.values(CliToolUnsupportedCommands),
  ...REDIS_CLI_CONFIG.unsupportedCommands,
];

export const getBlockingCommands = (): string[] => Object.values(CliToolBlockingCommands);

export function decimalToHexString(d: number, padding: number = 2): string {
  const hex = Number(d).toString(16);
  return '0'.repeat(padding).substr(0, padding - hex.length) + hex;
}

export function checkHumanReadableCommands(commandLine: string): boolean {
  // The list of command got from cliSendCommand() function in redis-cli.c from Redis source code.
  return !!Object.values(CliToolHumanReadableCommands)
    .find((command) => commandLine.toLowerCase().startsWith(command));
}

export function checkRedirectionError(error: ReplyError): boolean {
  try {
    return error.message.startsWith('MOVED') || error.message.startsWith('ASK');
  } catch (e) {
    return false;
  }
}

export function parseRedirectionError(error: ReplyError): IRedirectionInfo {
  try {
    const [, slot, address] = error.message.split(' ');
    const { port } = new URL(`redis://${address}`);
    if (!port) {
      throw new Error();
    }
    return { slot, address };
  } catch (e) {
    throw new RedirectionParsingError();
  }
}

interface IPipelineSummary {
  summary: string,
  length: number,
}

export function getRedisPipelineSummary(
  pipeline: Array<[toolCommand: any, ...args: Array<string | number | Buffer>]>,
  limit: number = LOGGER_CONFIG.pipelineSummaryLimit,
): IPipelineSummary {
  const result: IPipelineSummary = {
    summary: '[]',
    length: 0,
  };
  try {
    const commands = pipeline.reduce((prev, cur) => [...prev, cur[0]], []);
    result.length = commands.length;
    result.summary = commands.length > limit
      ? JSON.stringify([...take(commands, limit), '...'])
      : JSON.stringify(commands);
  } catch (e) {
    // continue regardless of error
  }
  return result;
}

export const multilineCommandToOneLine = (text: string = '') => text
  .split(/(\r\n|\n|\r)+\s+/gm)
  .filter((line: string) => !(BLANK_LINE_REGEX.test(line) || isEmpty(line)))
  .join(' ');
