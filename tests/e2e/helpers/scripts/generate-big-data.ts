import { isNull, isNumber } from 'lodash';
import RedisClient from '@redis/client/dist/lib/client';


const iterationsPrimary = 500_000;
const iterationsSecondary = 125_000;
const batchSizeDefault = 10_000;

type CommandType = [cmd: string, ...args: (string | number)[]];
type CommandsType = CommandType[];

function prepareCommandArgs(args: CommandType) {
  const strArgs = args.map((arg) => (isNumber(arg) ? arg.toString() : arg)) as string[];
  if (!strArgs || !strArgs.length) {
    return [];
  }
  const cmdArg = strArgs.shift() || '';
  return [...cmdArg.split(' '), ...strArgs];
}

function prepareCommandOptions(options: {
  replyEncoding?: string;
}): any {
  let replyEncoding: string | null = null;

  if (options?.replyEncoding === 'utf8') {
    replyEncoding = 'utf8';
  }

  return {
    returnBuffers: isNull(replyEncoding),
  };
}

async function sendCommand(client: RedisClient<any, any, any>, command: CommandType, options ?: any) {
  let commandArgs = prepareCommandArgs(command);
  return client.sendCommand(commandArgs, prepareCommandOptions(options));
}

async function sendPipeline(
  client: RedisClient<any, any, any>,
  commands: CommandsType,
  options?: any,
) {
  return Promise.all(
    commands.map(
      (cmd) => sendCommand(client, cmd, options)
        .then((res: any) => [null, res])
        .catch((e: any) => [e, null]),
    ),
  );
}

function* generateBigData(baseKey: string, separator: string, limit: number, batchSize = batchSizeDefault) {
  const keyTypes = [
    'string', 'json', 'hash', 'list', 'set', 'zset',
  ];
  let sent = 0;
  while (sent < limit) {
    const commands: CommandsType = [];
    for (let i = 0; i < batchSize && sent < limit; i++) {
      sent += 1;
      for (const keyType of keyTypes) {
        const keyName = `${baseKey}${separator}${sent}${separator}${keyType}`;
        let command: CommandType;
        switch (keyType) {
          case 'json':
            command = ['json.set', keyName, '$', JSON.stringify({ id: sent })];
            break;
          case 'hash':
            command = ['hset', keyName, 'k0', sent];
            break;
          case 'list':
            command = ['lpush', keyName, sent];
            break;
          case 'set':
            command = ['sadd', keyName, sent];
            break;
          case 'zset':
            command = ['zadd', keyName, 0, sent];
            break;
          case 'string':
          default:
            command = ['set', keyName, `${sent}`];
            break;
        }
        commands.push(command);
      }
    }
    yield commands;
  }
}

const SIZES = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const toBytes = (size: number, type: string): number => {
  const key = SIZES.indexOf(type.toUpperCase());

  return Math.floor(size * 1024 ** key);
};

function generateRepeatedString(char: string = 'a', size: number | string = '10KB'): string {
  let bytes: number = 0;
  if (typeof size === 'string') {
    const unit = size.slice(-2).toUpperCase();
    const value = parseInt(size.slice(0, -2), 10);
    if (!SIZES.includes(unit)) {
      console.warn(`Invalid unit ${unit}, expected one of ${SIZES}`);
      bytes = value;
    } else {
      bytes = toBytes(value, unit);
    }
  } else if (typeof size === 'number') {
    bytes = size;
  }

  return char.repeat(bytes);
}

async function seedBigKeys(
  client: RedisClient<any, any, any>,
  keyName: string,
  command = 'set',
  generateCommand: (i: number) => (string | number) | (string | number)[],
  limit = 1_000_001, batchSize = 100,
) {
  const bigCommands: CommandsType = [];
  let batchCommands: (string | number)[] = [];
  for (let i = 1; i < limit; i++) {
    const items = generateCommand(i);
    if (Array.isArray(items)) {
      batchCommands.push(...items);
    } else {
      batchCommands.push(items);
    }
    if (i % batchSize === 0) {
      bigCommands.push([command, keyName, ...batchCommands]);
      batchCommands = [];
    }
  }
  await sendPipeline(client, bigCommands);
}

/**
 * Populate big keys in Redis Database
 *
 * Generates a range of keys and values to demonstrate large data sets.
 *
 * @param client - The Redis client to use.
 * @param withBigStrings - If `true`, generates big string keys as well.
 * @returns A promise that resolves when the keys are populated.
 */
export const populateBigKeys = async (client: RedisClient<any, any, any>, withBigStrings = false) => {
  const bigStrings = [
    {
      char: 'a',
      size: '1MB',
      content: '1MB key',
    },
    {
      char: 'b',
      size: '2MB',
      content: '2MB key',
    },
    {
      char: 'c',
      size: '3MB',
      content: '3MB key',
    },
    {
      char: 'd',
      size: '4MB',
      content: '4MB key',
    },
    {
      char: 'e',
      size: '5MB',
      content: '5MB key',
    },
  ];
  try {
    console.log('Starting big keys...');
    await client.connect();
    if (withBigStrings) {
      console.log('Generating big string keys...');
      const bigKeyStringCommands: CommandsType = [];
      for (const {
        char,
        size,
        content
      } of bigStrings) {
        const key = generateRepeatedString(char, size);
        bigKeyStringCommands.push(['set', key, content]);
      }
      await sendPipeline(client, bigKeyStringCommands);
    }
    // big string 5M
    console.log('Generating 5 MB string key...');
    const bigStringKey = 'big string 5MB';
    await sendCommand(client, ['set', bigStringKey, generateRepeatedString('e', '5MB')]);

    // big hash 1M
    console.log('Generating 1_000_000 fields hash key...');
    await seedBigKeys(client, 'big hash 1M', 'hset', (i) => [`key${i}`, i], 1_000_001, 100);
    // big list 1M
    console.log('Generating 1_000_000 items list key...');
    await seedBigKeys(client, 'big list 1M', 'lpush', (i) => i, 1_000_001, 100);
    // big set 1M
    console.log('Generating 1_000_000 items set key...');
    await seedBigKeys(client, 'big set 1M', 'sadd', (i) => i, 1_000_001, 100);
    // big zset 1M
    console.log('Generating 1_000_000 items zset key...');
    await seedBigKeys(client, 'big zset 1M', 'zadd', (i) => [i, i], 1_000_001, 100);
    console.log('Done');
  } catch (e) {
    console.error(e);
  } finally {
    await client.disconnect();
  }
};

type PopulateDbOptionsType = {
  mainKeysLimit?: number;
  secondaryKeysLimit?: number;
  separatorPrimary?: string;
  separatorSecondary?: string;
  baseKeys?: string[];
  secondaryKeys?: string[];
}

/**
 * Populate Redis database with data.
 *
 * Populates Redis database with data in format of:
 * - Primary key: `device:eu-east-1:1`, `device:eu-east-1:2`, ... `device:eu-east-1:1000`
 * - Secondary key: `device_eu-east-1_1`, `device_eu-east-1_2`, ... `device_eu-east-1_1000`
 *
 * @param client - Redis client object
 * @param {PopulateDbOptionsType} options - Options object
 */
export const populateDb = async (
  client: RedisClient<any, any, any>,
  {
    mainKeysLimit = iterationsPrimary,
    secondaryKeysLimit = iterationsSecondary,
    baseKeys = [
      'device', 'mobile', 'user',
    ],
    secondaryKeys = [
      'eu-east-1', 'eu-west-1', 'us-east-1', 'us-west-1',
    ],
    separatorPrimary = ':',
    separatorSecondary = '_',
  }: PopulateDbOptionsType,
): Promise<void> => {

  try {
    console.log('Starting...');
    client.on('error', err => console.log('Redis Client Error', err));
    let executions = 0;
    await client.connect();
    for (let bk of baseKeys) {
      const generator = generateBigData(bk, separatorPrimary, mainKeysLimit);
      for (const commands of generator) {
        // process the commands
        await sendPipeline(client, commands);
        console.log(`${bk}: ${++executions}`);
      }

      for (let sk of secondaryKeys) {
        const generator = generateBigData(`${bk}${separatorSecondary}${sk}`, separatorSecondary, secondaryKeysLimit);
        for (const commands of generator) {
          // process the commands
          await sendPipeline(client, commands);
          console.log(`${bk}${separatorSecondary}${sk}: ${++executions}`);
        }
      }
    }

    console.log('Done');
  } catch (e) {
    console.error(e);
  } finally {
    await client.disconnect();
  }
};
// const host = '127.0.0.1';
// const port = '6666';
// const port = '8103';
// const url = `redis://default@${host}:${port}`;

// const client: RedisClient<any, any, any> = createClient({url});
//
// const remoteClient = createClient({
//   username: 'default',
//   password: 'Lg7qA8JPsOcBE8Em7e9fSRcHHHvsNpP7',
//   socket: {
//     host: 'redis-13690.crce8.us-east-1-mz.ec2.qa-cloud.redislabs.com',
//     port: 13690
//   }
// });
// populateBigKeys(client, true).then(() => {
//   console.log('Populating DB...');
//   return populateDb(client, iterationsPrimary, iterationsSecondary);
// });
