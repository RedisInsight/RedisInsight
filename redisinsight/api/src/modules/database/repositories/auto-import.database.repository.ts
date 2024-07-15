import { Injectable, Logger, NotImplementedException, OnApplicationBootstrap } from '@nestjs/common';
import { merge } from 'lodash';
import config from 'src/utils/config';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { LocalDatabaseRepository } from 'src/modules/database/repositories/local.database.repository';
import { Database } from 'src/modules/database/models/database';

const REDIS_AUTO_IMPORT_CONFIG = [
  {
    id: 'redis-auto-import-1',
    name: 'Redis Auto Import',
    host: 'localhost',
    port: '6379',
  },
  {
    id: 'redis-stack-server',
    name: 'Redis Stack Server',
    host: 'localhost',
    port: '6380',
  },
];

@Injectable()
export class AutoImportDatabaseRepository extends LocalDatabaseRepository implements OnApplicationBootstrap {
  protected logger = new Logger('AutoImportDatabaseRepository');

  async onApplicationBootstrap() {
    await this.setPredefinedDatabase(REDIS_AUTO_IMPORT_CONFIG);
  }

  // /**
  //  * @inheritDoc
  //  */
  // async exists(): Promise<boolean> {
  //   return super.exists(REDIS_AUTO_IMPORT_CONFIG.id);
  // }

  /**
   * @inheritDoc
   */
  async get(
    id: string,
    ignoreEncryptionErrors: boolean = false,
    omitFields: string[] = [],
  ): Promise<Database> {
    const database = REDIS_AUTO_IMPORT_CONFIG.find((config) => config.id === id);
    return super.get(database.id, ignoreEncryptionErrors, omitFields);
  }

  /**
   * @inheritDoc
   */
  async list(): Promise<Database[]> {

    const databases = await Promise.all(REDIS_AUTO_IMPORT_CONFIG.map(async (config) => await this.get(config.id)));

    return databases;
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
    const database = REDIS_AUTO_IMPORT_CONFIG.find((config) => config.id === id);

    return super.update(database.id, data);
  }

  private async setPredefinedDatabase(
    options: { id: string; name: string; host: string; port: string; }[],
  ): Promise<void> {
    try {
      options.forEach(async (option) => {
        const {
          id, name, host, port,
        } = option;
        const isExist = await this.exists(id);
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
      });
      this.logger.log(`Succeed to set predefined databases - ${options}`);
    } catch (error) {
      this.logger.error('Failed to set predefined database', error);
    }
  }

  /**
   * @inheritDoc
   */
  async delete(id: string): Promise<void> {
    return Promise.reject(new NotImplementedException('This functionality is not supported'));
  }
}
