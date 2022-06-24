import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { AppTool } from 'src/models';
import { withTimeout } from 'src/utils/promise-with-timeout';
import ERROR_MESSAGES from 'src/constants/error-messages';
import config from 'src/utils/config';
import { RedisClient } from 'src/modules/pub-sub/model/redis-client';

const serverConfig = config.get('server');

@Injectable()
export class RedisClientProvider {
  constructor(
    private redisService: RedisService,
    private instancesBusinessService: InstancesBusinessService,
  ) {}

  createClient(databaseId: string): RedisClient {
    return new RedisClient(databaseId, this.getConnectFn(databaseId));
  }

  private getConnectFn(databaseId: string) {
    return () => withTimeout(
      this.instancesBusinessService.connectToInstance(
        databaseId,
        AppTool.Common,
        false,
      ),
      serverConfig.requestTimeout,
      new ServiceUnavailableException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
    );
  }
}
