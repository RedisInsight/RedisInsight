import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { withTimeout } from 'src/utils/promise-with-timeout';
import ERROR_MESSAGES from 'src/constants/error-messages';
import config, { Config } from 'src/utils/config';
import { RedisClient } from 'src/modules/pub-sub/model/redis-client';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { ClientMetadata } from 'src/common/models';

const serverConfig = config.get('server') as Config['server'];

@Injectable()
export class RedisClientProvider {
  constructor(
    private databaseConnectionService: DatabaseConnectionService,
  ) {}

  createClient(clientMetadata: ClientMetadata): RedisClient {
    return new RedisClient(clientMetadata.databaseId, this.getConnectFn(clientMetadata));
  }

  private getConnectFn(clientMetadata: ClientMetadata) {
    return () => withTimeout(
      this.databaseConnectionService.createClient(clientMetadata),
      serverConfig.requestTimeout,
      new ServiceUnavailableException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
    );
  }
}
