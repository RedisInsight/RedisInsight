import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AppTool } from 'src/models';
import { withTimeout } from 'src/utils/promise-with-timeout';
import ERROR_MESSAGES from 'src/constants/error-messages';
import config from 'src/utils/config';
import { RedisClient } from 'src/modules/pub-sub/model/redis-client';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';

const serverConfig = config.get('server');

@Injectable()
export class RedisClientProvider {
  constructor(
    private databaseConnectionService: DatabaseConnectionService,
  ) {}

  createClient(databaseId: string): RedisClient {
    return new RedisClient(databaseId, this.getConnectFn(databaseId));
  }

  private getConnectFn(databaseId: string) {
    return () => withTimeout(
      this.databaseConnectionService.createClient({
        databaseId,
        namespace: AppTool.Common,
      }),
      serverConfig.requestTimeout,
      new ServiceUnavailableException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
    );
  }
}
