import { Injectable } from '@nestjs/common';
import { ClientContext } from 'src/common/models';
import { RedisService } from 'src/modules/redis/redis.service';
import { RedisToolService } from 'src/modules/redis/redis-tool.service';
import { IRedisToolOptions } from 'src/modules/redis/redis-tool-options';
import { DatabaseService } from 'src/modules/database/database.service';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

@Injectable()
export class RedisToolFactory {
  constructor(
    protected redisService: RedisService,
    protected redisConnectionFactory: RedisConnectionFactory,
    protected databaseService: DatabaseService,
  ) {}

  createRedisTool(clientContext: ClientContext, options: IRedisToolOptions = {}) {
    return new RedisToolService(
      clientContext,
      this.redisService,
      this.redisConnectionFactory,
      this.databaseService,
      options,
    );
  }
}
