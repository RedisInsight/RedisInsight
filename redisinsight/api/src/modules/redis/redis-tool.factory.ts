import { Injectable } from '@nestjs/common';
import { ClientContext } from 'src/common/models';
import { RedisService } from 'src/modules/redis/redis.service';
import { RedisToolService } from 'src/modules/redis/redis-tool.service';
import { IRedisToolOptions } from 'src/modules/redis/redis-tool-options';
import { DatabaseService } from 'src/modules/database/database.service';

@Injectable()
export class RedisToolFactory {
  constructor(
    protected redisService: RedisService,
    protected databaseService: DatabaseService,
  ) {}

  createRedisTool(clientContext: ClientContext, options: IRedisToolOptions = {}) {
    return new RedisToolService(clientContext, this.redisService, this.databaseService, options);
  }
}
