import { promises as fs } from 'fs';
import { v5 as uuidv5 } from 'uuid';
import { plainToClass } from 'class-transformer';
import { Validator } from 'class-validator';
import { get, set } from 'lodash';
import {
  Injectable,
  Logger,
  NotImplementedException,
  OnApplicationBootstrap,
  ForbiddenException,
} from '@nestjs/common';
import config from 'src/utils/config';
import { classToClass, determineConnectionType, fieldsMapSchema } from 'src/utils';
import { ConnectionType, Compressor } from 'src/modules/database/entities/database.entity';
import { LocalDatabaseRepository } from 'src/modules/database/repositories/local.database.repository';
import { Database } from 'src/modules/database/models/database';
import { ImportDatabaseDto } from 'src/modules/database-import/dto/import.database.dto';
import {
  InvalidCompressorException,
} from 'src/modules/database-import/exceptions';

const AutoImportConfig = config.get('preSetupDatabase');
const RI_DISABLE_MANAGE_CONNECTIONS = AutoImportConfig.disableManageConnections;

@Injectable()
export class AutoImportDatabaseRepository extends LocalDatabaseRepository implements OnApplicationBootstrap {
  protected logger = new Logger('AutoImportDatabaseRepository');

  private validator = new Validator();

  async onApplicationBootstrap() {
    this.processFile(AutoImportConfig.importFile);
  }

  /**
   * @inheritDoc
   */
  async get(
    id: string,
    ignoreEncryptionErrors: boolean = false,
    omitFields: string[] = [],
  ): Promise<Database> {
    return super.get(id, ignoreEncryptionErrors, omitFields);
  }

  /**
   * @inheritDoc
   */
  async list(): Promise<Database[]> {
    return await (await super.list()).filter((db) => db.id === this.getDatabaseId(db.name));
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
    return super.update(id, data);
  }

  getDatabaseId(name: string) {
    return uuidv5(name, 'f7c8bfce-3a2f-59b1-9c8b-2ac0efc81024');
  }

  private async setPredefinedDatabase(
    options: { id: string; name: string; host: string; port: string; }[],
  ): Promise<void> {
    const existingDatabases = await super.list();

    if (existingDatabases.length > 0) {
      this.logger.log('Predefined databases already exist. Skipping the process.');
      return;
    }

    try {
      options.forEach(async (option) => {
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

  /**
   * @inheritDoc
   */
  async processFile(filename: string): Promise<void> {
    const existingDatabases = await super.list();
    if (existingDatabases.length > 0) {
      this.logger.log('Not importing databases since there are databases.');
      return;
    }

    const fileData = await fs.readFile(filename, { encoding: 'utf8' });
    const databases = JSON.parse(fileData as unknown as string);

    if (!Array.isArray(databases)) {
      throw new Error('Invalid data format');
    }

    databases.forEach(async (db) => {
      const isExist = await this.exists(db.id);
      if (isExist) {
        return;
      }

      const data: any = {};

      data.new = true;

      fieldsMapSchema.forEach(([field, paths]) => {
        let value;
        paths.every((path) => {
          value = get(db, path);
          return value === undefined;
        });

        set(data, field, value);
      });

      if (!data.name) {
        data.name = `${data.host}:${data.port}`;
      }

      data.connectionType = determineConnectionType(data);

      if (data?.sentinelMasterName) {
        data.sentinelMaster = {
          name: data.sentinelMasterName,
          username: data.sentinelMasterUsername || undefined,
          password: data.sentinelMasterPassword,
        };
        data.nodes = [{
          host: data.host,
          port: parseInt(data.port, 10),
        }];
      }
      if (data?.compressor && !(data.compressor in Compressor)) {
        data.compressor = Compressor.NONE;
      }

      const dto = plainToClass(
        ImportDatabaseDto,
        Object.keys(data)
          .reduce((acc, key) => {
            acc[key] = data[key] === '' ? null : data[key];
            return acc;
          }, {}),
        {
          groups: ['security'],
        },
      );

      await this.validator.validateOrReject(dto, {
        whitelist: true,
      });

      const database = classToClass(Database, dto);
      database.id = this.getDatabaseId(database.name);

      await super.create(database, false);
    });
  }
}
