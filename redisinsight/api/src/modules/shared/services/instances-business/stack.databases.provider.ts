import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { merge } from 'lodash';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import config from 'src/utils/config';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { DatabasesProvider } from 'src/modules/shared/services/instances-business/databases.provider';

const REDIS_STACK_CONFIG = config.get('redisStack');

@Injectable()
export class StackDatabasesProvider extends DatabasesProvider implements OnApplicationBootstrap {
  protected logger = new Logger('StackDatabasesProvider');

  async onApplicationBootstrap() {
    await this.setPredefinedDatabase(merge({
      name: 'Redis Stack',
      host: 'localhost',
      port: '6379',
    }, REDIS_STACK_CONFIG));
  }

  /**
   * Check if database for Stack exists.
   */
  async exists(): Promise<boolean> {
    return super.exists(REDIS_STACK_CONFIG.id);
  }

  /**
   * Get list of databases from the local db
   */
  async getAll(): Promise<DatabaseEntity[]> {
    this.logger.log('Getting databases list');
    return [await this.getOneById(REDIS_STACK_CONFIG.id)];
  }

  /**
   * Get single database by id from the local db
   * @throws NotFoundException in case when no database found
   */
  async getOneById(
    id: string,
    ignoreEncryptionErrors: boolean = false,
  ): Promise<DatabaseEntity> {
    return super.getOneById(REDIS_STACK_CONFIG.id, ignoreEncryptionErrors);
  }

  /**
   * Save entire entity
   * @param database
   */
  async save(database: DatabaseEntity): Promise<DatabaseEntity> {
    return super.save(new DatabaseEntity({
      ...database,
      id: REDIS_STACK_CONFIG.id,
    }));
  }

  /**
   * Update database field(s) without encryption logic
   * @param id
   * @param data
   * @throws BadRequestException error when try to update password or sentinelMasterPassword fields
   */
  async patch(id: string, data: QueryDeepPartialEntity<DatabaseEntity>) {
    return super.patch(REDIS_STACK_CONFIG.id, {
      ...data,
      id: REDIS_STACK_CONFIG.id,
    });
  }

  /**
   * Update entire database entity with fields encryption logic
   *
   * @param id
   * @param data
   */
  async update(id: string, data: DatabaseEntity) {
    return super.update(REDIS_STACK_CONFIG.id, new DatabaseEntity({
      ...data,
      id: REDIS_STACK_CONFIG.id,
    }));
  }

  /**
   * Save database entity for Stack
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
        const database: any = this.databasesRepository.create({
          id,
          host,
          port: parseInt(port, 10),
          name,
          tls: false,
          verifyServerCert: false,
        });
        await this.save(database);
      }
      this.logger.log(`Succeed to set predefined database ${id}`);
    } catch (error) {
      this.logger.error('Failed to set predefined database', error);
    }
  }
}
