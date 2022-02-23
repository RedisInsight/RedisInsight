import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { merge } from 'lodash';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import config from 'src/utils/config';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';
import { DatabasesProvider } from 'src/modules/shared/services/instances-business/databases.provider';

const REDIS_STACK_CONFIG = config.get('redisStack');

@Injectable()
export class StackDatabasesProvider extends DatabasesProvider implements OnApplicationBootstrap {
  protected logger = new Logger('StackDatabasesProvider');

  async onApplicationBootstrap() {
    if (REDIS_STACK_CONFIG?.id) {
      await this.setPredefinedDatabase(merge({
        name: 'Redis Stack',
        host: 'localhost',
        port: '6379',
      }, REDIS_STACK_CONFIG));
    }
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
  async getAll(): Promise<DatabaseInstanceEntity[]> {
    this.logger.log('Getting databases list');
    return [await this.getOneById(REDIS_STACK_CONFIG.id)];
  }

  /**
   * @inheritDoc
   */
  async getOneById(
    id: string,
    ignoreEncryptionErrors: boolean = false,
  ): Promise<DatabaseInstanceEntity> {
    return super.getOneById(REDIS_STACK_CONFIG.id, ignoreEncryptionErrors);
  }

  /**
   * @inheritDoc
   */
  async save(database: DatabaseInstanceEntity): Promise<DatabaseInstanceEntity> {
    return super.save(new DatabaseInstanceEntity({
      ...database,
      id: REDIS_STACK_CONFIG.id,
    }));
  }

  /**
   * @inheritDoc
   */
  async patch(id: string, data: QueryDeepPartialEntity<DatabaseInstanceEntity>) {
    return super.patch(REDIS_STACK_CONFIG.id, {
      ...data,
      id: REDIS_STACK_CONFIG.id,
    });
  }

  /**
   * @inheritDoc
   */
  async update(id: string, data: DatabaseInstanceEntity) {
    return super.update(REDIS_STACK_CONFIG.id, new DatabaseInstanceEntity({
      ...data,
      id: REDIS_STACK_CONFIG.id,
    }));
  }

  private async setPredefinedDatabase(
    options: { id: string; name: string; host: string; port: string; },
  ): Promise<void> {
    try {
      const {
        id, name, host, port,
      } = options;
      const isExist = await this.exists();
      if (!isExist) {
        const database: any = this.databasesRepository.create({
          id,
          host,
          port: parseInt(port, 10),
          name,
          username: null,
          password: null,
          tls: false,
          verifyServerCert: false,
          db: 0,
        });
        await this.save(database);
      }
      this.logger.log(`Succeed to set predefined database ${id}`);
    } catch (error) {
      this.logger.error('Failed to set predefined database', error);
    }
  }
}
