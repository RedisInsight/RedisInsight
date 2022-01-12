import { Injectable } from '@nestjs/common';
import { AppTool } from 'src/models';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { RedisToolService } from 'src/modules/shared/services/base/redis-tool.service';

@Injectable()
export class RedisToolFactory {
  constructor(
    protected redisService: RedisService,
    protected instancesBusinessService: InstancesBusinessService,
  ) {}

  createRedisTool(appTool: AppTool) {
    return new RedisToolService(appTool, this.redisService, this.instancesBusinessService);
  }
}
