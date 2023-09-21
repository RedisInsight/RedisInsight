import {
  Injectable, Logger, NotImplementedException, OnApplicationBootstrap,
} from '@nestjs/common';
import { merge } from 'lodash';
import config from 'src/utils/config';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { LocalDatabaseRepository } from 'src/modules/database/repositories/local.database.repository';
import { Database } from 'src/modules/database/models/database';

const REDIS_STACK_CONFIG = config.get('redisStack');

@Injectable()
export class StackDatabasesRepository extends LocalDatabaseRepository implements OnApplicationBootstrap {
  protected logger = new Logger('StackDatabasesRepository');

  async onApplicationBootstrap() {
    await this.setPredefinedDatabase(merge({
      name: 'Redis Stack',
      host: 'localhost',
      port: '6379',
    }, REDIS_STACK_CONFIG));
  }

  /**
   * @inheritDoc
   */
  async exists(): Promise<boolean> {
    return super.exists(REDIS_STACK_CONFIG.id);
  }

  /**
   * @inheritDoc
   */
  async get(
    id: string,
    ignoreEncryptionErrors: boolean = false,
  ): Promise<Database> {
    return super.get(REDIS_STACK_CONFIG.id, ignoreEncryptionErrors);
  }

  /**
   * @inheritDoc
   */
  async list(): Promise<Database[]> {
    return [await this.get(REDIS_STACK_CONFIG.id)];
  }

  /**
   * @inheritDoc
   */
  async create() {
    return Promise.reject(new NotImplementedException('This functionality is not supported'));
  }

  /**
   * @inheritDoc
   */
  async update(id: string, data: Database) {
    return super.update(REDIS_STACK_CONFIG.id, data);
  }

  /**
   * Create database entity for Stack
   *
   * @param options
   */
  private async setPredefinedDatabase(
    options: { id: string; name: string; host: string; port: string; },
  ): Promise<void> {
    try {
      const {
        id, name, host, port,
      } = options;
      const isExist = await this.exists();
      if (!isExist) {
        await super.create({
          id,
          host,
          port: parseInt(port, 10),
          name,
          tls: false,
          verifyServerCert: false,
          connectionType: ConnectionType.STANDALONE,
          lastConnection: null,
        }, false);
      }
      this.logger.log(`Succeed to set predefined database ${id}`);
    } catch (error) {
      this.logger.error('Failed to set predefined database', error);
    }
  }
}
