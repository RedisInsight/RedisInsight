import {
  Injectable, InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import {
  isEmpty, omit, reject, sum, omitBy, isUndefined,
} from 'lodash';
import { Database } from 'src/modules/database/models/database';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import {
  catchRedisConnectionError, classToClass, getRedisConnectionException,
} from 'src/utils';
import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseFactory } from 'src/modules/database/providers/database.factory';
import { UpdateDatabaseDto } from 'src/modules/database/dto/update.database.dto';
import { AppRedisInstanceEvents, RedisErrorCodes } from 'src/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeleteDatabasesResponse } from 'src/modules/database/dto/delete.databases.response';
import { ClientContext, SessionMetadata } from 'src/common/models';
import { ExportDatabase } from 'src/modules/database/models/export-database';
import { deepMerge } from 'src/common/utils';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';
import { IRedisConnectionOptions, RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import { LoggerService } from 'src/modules/logger/logger.service';

@Injectable()
export class DatabaseService {
  private readonly exportSecurityFields: string[] = [
    'password',
    'clientCert.key',
    'sshOptions.password',
    'sshOptions.passphrase',
    'sshOptions.privateKey',
    'sentinelMaster.password',
  ];

  static connectionFields: string[] = [
    'host',
    'port',
    'db',
    'username',
    'password',
    'tls',
    'tlsServername',
    'verifyServerCert',
    'sentinelMaster',
    'ssh',
    'sshOptions',
    'caCert',
    'clientCert',
  ];

  static endpointFields: string[] = [
    'host',
    'port',
  ];

  constructor(
    private logger: LoggerService,
    private repository: DatabaseRepository,
    private redisClientStorage: RedisClientStorage,
    private redisClientFactory: RedisClientFactory,
    private databaseInfoProvider: DatabaseInfoProvider,
    private databaseFactory: DatabaseFactory,
    private analytics: DatabaseAnalytics,
    private eventEmitter: EventEmitter2,
  ) {}

  static isConnectionAffected(dto: object) {
    return Object.keys(omitBy(dto, isUndefined)).some((field) => this.connectionFields.includes(field));
  }

  static isEndpointAffected(dto: object) {
    return Object.keys(omitBy(dto, isUndefined)).some((field) => this.endpointFields.includes(field));
  }

  private async merge(database: Database, dto: UpdateDatabaseDto): Promise<Database> {
    const updatedDatabase = database;
    if (dto?.caCert) {
      updatedDatabase.caCert = dto.caCert as CaCertificate;
    }

    if (dto?.clientCert) {
      updatedDatabase.clientCert = dto.clientCert as ClientCertificate;
    }
    return deepMerge(updatedDatabase, dto);
  }

  /**
   * Simply checks if database exists
   * @param sessionMetadata
   * @param id
   */
  async exists(sessionMetadata: SessionMetadata, id: string): Promise<boolean> {
    this.logger.debug(`Checking if database with ${id} exists.`, sessionMetadata);
    return this.repository.exists(sessionMetadata, id);
  }

  /**
   * Get list of databases
   * TBD add pagination, filters, sorting, search, etc.
   * @param sessionMetadata
   */
  async list(sessionMetadata: SessionMetadata): Promise<Database[]> {
    try {
      this.logger.debug('Getting databases list', sessionMetadata);
      return await this.repository.list(sessionMetadata);
    } catch (e) {
      this.logger.error('Failed to get database instance list.', e, sessionMetadata);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Gets full database model by id
   * @param sessionMetadata
   * @param id
   * @param ignoreEncryptionErrors
   */
  async get(
    sessionMetadata: SessionMetadata,
    id: string,
    ignoreEncryptionErrors = false,
    omitFields?: string[],
  ): Promise<Database> {
    this.logger.debug(`Getting database ${id}`, sessionMetadata);

    if (!id) {
      this.logger.error('Database id was not provided', sessionMetadata);
      throw new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
    }

    const model = await this.repository.get(sessionMetadata, id, ignoreEncryptionErrors, omitFields);

    if (!model) {
      this.logger.error(`Database with ${id} was not Found`, sessionMetadata);
      throw new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
    }

    return model;
  }

  /**
   * Create new database with auto-detection of database type, modules, etc.
   * @param sessionMetadata
   * @param dto
   * @param uniqueCheck
   * @param options
   */
  async create(
    sessionMetadata: SessionMetadata,
    dto: CreateDatabaseDto,
    uniqueCheck = false,
    options: IRedisConnectionOptions = {},
  ): Promise<Database> {
    try {
      this.logger.debug('Creating new database.', sessionMetadata);

      const database = await this.repository.create(
        sessionMetadata,
        {
          ...await this.databaseFactory.createDatabaseModel(
            sessionMetadata,
            classToClass(Database, dto),
            options,
          ),
          new: true,
        },
        uniqueCheck,
      );

      // todo: clarify if we need this and if yes - rethink implementation
      try {
        const client = await this.redisClientFactory.createClient(
          {
            sessionMetadata,
            databaseId: database.id,
            context: ClientContext.Common,
          },
          database,
        );
        const redisInfo = await this.databaseInfoProvider.getRedisGeneralInfo(client);
        this.analytics.sendInstanceAddedEvent(sessionMetadata, database, redisInfo);
        await client.disconnect();
      } catch (e) {
        // ignore error
      }

      return database;
    } catch (error) {
      this.logger.error('Failed to add database.', error, sessionMetadata);

      const exception = getRedisConnectionException(error, dto);

      this.analytics.sendInstanceAddFailedEvent(sessionMetadata, exception);

      throw exception;
    }
  }

  /**
   * Update database model by id
   * @param sessionMetadata
   * @param id
   * @param dto
   * @param manualUpdate
   */
  public async update(
    sessionMetadata: SessionMetadata,
    id: string,
    dto: UpdateDatabaseDto,
    manualUpdate: boolean = true, // todo: remove manualUpdate flag logic
  ): Promise<Database> {
    this.logger.debug(`Updating database: ${id}`, sessionMetadata);
    const oldDatabase = await this.get(sessionMetadata, id, true);

    let database: Database;
    try {
      database = await this.merge(oldDatabase, dto);

      if (DatabaseService.isConnectionAffected(dto)) {
        if (DatabaseService.isEndpointAffected(dto)) {
          database.provider = undefined;
        }

        database = await this.databaseFactory.createDatabaseModel(sessionMetadata, database);

        await this.redisClientStorage.removeManyByMetadata({ databaseId: id });
      }

      database = await this.repository.update(sessionMetadata, id, database);

      // todo: rethink
      this.analytics.sendInstanceEditedEvent(
        sessionMetadata,
        oldDatabase,
        database,
        manualUpdate,
      );

      return database;
    } catch (error) {
      this.logger.error(`Failed to update database instance ${id}`, error, sessionMetadata);
      throw catchRedisConnectionError(error, database);
    }
  }

  /**
   * Test connection for new/modified config before creating/updating database
   * @param sessionMetadata
   * @param dto
   * @param id
   */
  public async testConnection(
    sessionMetadata: SessionMetadata,
    dto: CreateDatabaseDto | UpdateDatabaseDto,
    id?: string,
  ): Promise<void> {
    let database: Database;

    if (id) {
      this.logger.debug('Testing existing database connection', sessionMetadata);

      database = await this.merge(await this.get(sessionMetadata, id, false), dto);
    } else {
      this.logger.debug('Testing new database connection', sessionMetadata);
      database = classToClass(Database, dto);
    }

    try {
      await this.databaseFactory.createDatabaseModel(sessionMetadata, database);

      return;
    } catch (error) {
      // don't throw an error to support sentinel autodiscovery flow
      if (error.message === RedisErrorCodes.SentinelParamsRequired) {
        return;
      }

      this.logger.error('Connection test failed', error, sessionMetadata);
      throw catchRedisConnectionError(error, database);
    }
  }

  /**
   * Clone database with updated fields
   * @param sessionMetadata
   * @param id
   * @param dto
   */
  public async clone(sessionMetadata: SessionMetadata, id: string, dto: UpdateDatabaseDto): Promise<Database> {
    this.logger.debug('Clone existing database', sessionMetadata);
    const database = await this.merge(
      await this.get(sessionMetadata, id, false, ['id', 'sshOptions.id']),
      dto,
    );
    if (DatabaseService.isConnectionAffected(dto)) {
      return await this.create(sessionMetadata, database);
    }

    const createdDatabase = await this.repository.create(
      sessionMetadata,
      {
        ...classToClass(Database, database),
        new: true,
      },
      false,
    );

    this.analytics.sendInstanceAddedEvent(sessionMetadata, createdDatabase);
    return createdDatabase;
  }

  /**
   * Delete database instance by id
   * Also close all opened connections for this database
   * Also emit an event to entire app to be processed by other parts
   * @param sessionMetadata
   * @param id
   */
  async delete(sessionMetadata: SessionMetadata, id: string): Promise<void> {
    this.logger.debug(`Deleting database: ${id}`, sessionMetadata);
    const database = await this.get(sessionMetadata, id, true);
    try {
      await this.repository.delete(sessionMetadata, id);
      // todo: rethink
      await this.redisClientStorage.removeManyByMetadata({ databaseId: id });
      this.logger.debug('Succeed to delete database instance.', sessionMetadata);

      this.analytics.sendInstanceDeletedEvent(sessionMetadata, database);
      this.eventEmitter.emit(AppRedisInstanceEvents.Deleted, id);
    } catch (error) {
      this.logger.error(`Failed to delete database: ${id}`, error, sessionMetadata);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Bulk delete databases. Uses "delete" method and skipping error
   * Returns successfully deleted databases number
   * @param sessionMetadata
   * @param ids
   */
  async bulkDelete(sessionMetadata: SessionMetadata, ids: string[]): Promise<DeleteDatabasesResponse> {
    this.logger.debug(`Deleting many database: ${ids}`, sessionMetadata);

    return {
      affected: sum(await Promise.all(ids.map(async (id) => {
        try {
          await this.delete(sessionMetadata, id);
          return 1;
        } catch (e) {
          return 0;
        }
      }))),
    };
  }

  /**
   * Export many databases by ids.
   * Get full database model. With or without passwords and certificates bodies.
   * @param sessionMetadata
   * @param ids
   * @param withSecrets
   */
  async export(sessionMetadata: SessionMetadata, ids: string[], withSecrets = false): Promise<ExportDatabase[]> {
    const paths = !withSecrets ? this.exportSecurityFields : [];

    this.logger.debug(`Exporting many database: ${ids}`, sessionMetadata);

    if (!ids.length) {
      this.logger.error('Database ids were not provided', sessionMetadata);
      throw new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
    }

    const entities: ExportDatabase[] = reject(
      await Promise.all(ids.map(async (id) => {
        try {
          return await this.get(sessionMetadata, id);
        } catch (e) {
          // ignore
        }
      })),
      isEmpty,
    );

    return entities.map((database) => classToClass(
      ExportDatabase,
      omit(database, paths),
      { groups: ['security'] },
    ));
  }
}
