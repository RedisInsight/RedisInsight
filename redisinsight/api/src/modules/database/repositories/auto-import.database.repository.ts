import {
  Injectable,
  Logger,
  NotImplementedException,
  OnApplicationBootstrap,
  ForbiddenException,
} from '@nestjs/common';
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

const AutoImportConfig = config.get('preSetupDatabase');
const RI_DISABLE_MANAGE_CONNECTIONS = AutoImportConfig.disableManageConnections;

@Injectable()
export class AutoImportDatabaseRepository extends LocalDatabaseRepository implements OnApplicationBootstrap {
  protected logger = new Logger('AutoImportDatabaseRepository');

  async onApplicationBootstrap() {
    if (AutoImportConfig.ENABLE_AUTO_IMPORT) {
      this.logger.warn('Database management is disabled by environment variable.');
      return;
    }
    await this.setPredefinedDatabase(REDIS_AUTO_IMPORT_CONFIG);
  }

  /**
   * @inheritDoc
   */
  async get(
    id: string,
    ignoreEncryptionErrors: boolean = false,
    omitFields: string[] = [],
  ): Promise<Database> {
    const database = REDIS_AUTO_IMPORT_CONFIG.find(c => c.id === id);
    return super.get(database.id, ignoreEncryptionErrors, omitFields);
  }

  /**
   * @inheritDoc
   */
  async list(): Promise<Database[]> {
    return await Promise.all(REDIS_AUTO_IMPORT_CONFIG.map(async c => await this.get(c.id)));
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
    if (RI_DISABLE_MANAGE_CONNECTIONS) {
      throw new ForbiddenException('Updating database connections is disabled.');
    }
    const database = REDIS_AUTO_IMPORT_CONFIG.find(c => c.id === id);
    return super.update(database.id, data);
  }

  private async setPredefinedDatabase(
    options: { id: string; name: string; host: string; port: string; }[],
  ): Promise<void> {
    if (RI_DISABLE_MANAGE_CONNECTIONS) {
      this.logger.warn('Setting predefined databases is disabled by environment variable.');
      return;
    }

    try {
      options.forEach(async option => {
        const {
          id,
          name,
          host,
          port,
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
    if (RI_DISABLE_MANAGE_CONNECTIONS) {
      throw new ForbiddenException('Deleting database connections is disabled.');
    }
    return super.delete(id);
  }

  // Additional method to check if management is disabled and hide export control
  public isManagementDisabled(): boolean {
    return !!RI_DISABLE_MANAGE_CONNECTIONS;
  }
}
