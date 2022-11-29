import { Injectable } from '@nestjs/common';
import { AppTool } from 'src/models';
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

  createRedisTool(appTool: AppTool, options: IRedisToolOptions = {}) {
    return new RedisToolService(appTool, this.redisService, this.databaseService, options);
  }
}
