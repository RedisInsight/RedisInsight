import { Redis, Command } from 'ioredis';
import { get } from 'lodash';
import { convertRedisInfoReplyToObject } from 'src/utils';
import { convertMultilineReplyToObject } from 'src/modules/redis/utils';

const getTotalFromInfo = async (client: Redis) => {
  try {
    const currentDbIndex = get(client, ['options', 'db'], 0);
    const info = convertRedisInfoReplyToObject(
      await client.sendCommand(new Command('info', ['keyspace'], {
        replyEncoding: 'utf8',
      })) as string,
    );

    const dbInfo = get(info, 'keyspace', {});
    if (!dbInfo[`db${currentDbIndex}`]) {
      return 0;
    }

    const { keys } = convertMultilineReplyToObject(dbInfo[`db${currentDbIndex}`], ',', '=');
    return parseInt(keys, 10);
  } catch (err) {
    return -1;
  }
};

const getTotalFromDBSize = async (client: Redis) => {
  const dbsize = await client.sendCommand(new Command('dbsize', [], {
    replyEncoding: 'utf8',
  })) as string;
  return parseInt(dbsize, 10);
};

/**
 * @deprecated
 */
export const getTotal = async (
  client: Redis,
): Promise<number> => {
  try {
    return await getTotalFromDBSize(client);
  } catch (err) {
    return await getTotalFromInfo(client);
  }
};
