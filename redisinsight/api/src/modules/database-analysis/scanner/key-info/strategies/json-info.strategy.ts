import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';
import { Command, Redis } from 'ioredis';

export class JsonInfoStrategy extends AbstractInfoStrategy {
  async getLength(client: Redis, key: RedisString): Promise<number> {
    const objectKeyType = await client.sendCommand(
      new Command('json.type', [key, '.'], {
        replyEncoding: 'utf8',
      }),
    );

    switch (objectKeyType) {
      case 'object':
        return await client.sendCommand(
          new Command('json.objlen', [key, '.'], {
            replyEncoding: 'utf8',
          }),
        ) as number;
      case 'array':
        return await client.sendCommand(
          new Command('json.arrlen', [key, '.'], {
            replyEncoding: 'utf8',
          }),
        ) as number;
      case 'string':
        return await client.sendCommand(
          new Command('json.strlen', [key, '.'], {
            replyEncoding: 'utf8',
          }),
        ) as number;
      default:
        return 0;
    }
  }
}
