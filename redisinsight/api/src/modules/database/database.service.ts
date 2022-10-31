import {
  Injectable, InternalServerErrorException, Logger, NotFoundException,
} from '@nestjs/common';
import { sum, merge } from 'lodash';
import { Database } from 'src/modules/database/models/database';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { catchRedisConnectionError, classToClass, getRedisConnectionException } from 'src/utils';
import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseFactory } from 'src/modules/database/providers/database.factory';
import { UpdateDatabaseDto } from 'src/modules/database/dto/update.database.dto';
import { AppRedisInstanceEvents } from 'src/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeleteDatabasesResponse } from 'src/modules/database/dto/delete.databases.response';

@Injectable()
export class DatabaseService {
  private logger = new Logger('DatabaseService');

  constructor(
    private repository: DatabaseRepository,
    private redisService: RedisService,
    private databaseInfoProvider: DatabaseInfoProvider,
    private databaseFactory: DatabaseFactory,
    private analytics: DatabaseAnalytics,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Simply checks if database exists
   * @param id
   */
  async exists(id: string): Promise<boolean> {
    this.logger.log(`Checking if database with ${id} exists.`);
    return this.repository.exists(id);
  }

  /**
   * Get list of databases
   * TBD add pagination, filters, sorting, search, etc.
   */
  async list(): Promise<Database[]> {
    try {
      this.logger.log('Getting databases list');
      const result = await this.repository.list();
      this.analytics.sendInstanceListReceivedEvent(result);
      return result;
    } catch (e) {
      this.logger.error('Failed to get database instance list.', e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Gets full database model by id
   * @param id
   * @param ignoreEncryptionErrors
   */
  async get(id: string, ignoreEncryptionErrors = false): Promise<Database> {
    this.logger.log(`Getting database ${id}`);

    const model = await this.repository.get(id, ignoreEncryptionErrors);

    if (!model) {
      this.logger.error(`Database with ${id} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
    }

    return model;
  }

  /**
   * Create new database with auto-detection of database type, modules, etc.
   * @param dto
   */
  async create(dto: CreateDatabaseDto): Promise<Database> {
    try {
      this.logger.log('Creating new database.');

      return await this.repository.create(
        await this.databaseFactory.createDatabaseModel(classToClass(Database, dto)),
      );

      // const redisInfo = await this.getInfo(result.id, AppTool.Common, true);
      // this.analytics.sendInstanceAddedEvent(result, redisInfo);
    } catch (error) {
      this.logger.error('Failed to add database.', error);

      const exception = getRedisConnectionException(error, dto);

      this.analytics.sendInstanceAddFailedEvent(exception);

      throw exception;
    }
  }

  // todo: remove manualUpdate flag logic
  public async update(
    id: string,
    dto: UpdateDatabaseDto,
    manualUpdate: boolean = true,
  ): Promise<Database> {
    this.logger.log(`Updating database: ${id}`);
    const oldDatabase = await this.get(id, true);
    let database = merge(oldDatabase, dto);

    try {
      database = await this.databaseFactory.createDatabaseModel(database);

      // todo: investigate manual update flag
      // if (manualUpdate) {
      //   databaseEntity.provider = getHostingProvider(databaseEntity.host);
      // }

      database = await this.repository.update(id, database);

      // todo: rethink
      this.redisService.removeClientInstance({ instanceId: id });
      this.analytics.sendInstanceEditedEvent(
        oldDatabase,
        database,
        manualUpdate,
      );

      return database;
    } catch (error) {
      this.logger.error(`Failed to update database instance ${id}`, error);
      throw catchRedisConnectionError(error, database);
    }
  }

  /**
   * Delete database instance by id
   * Also close all opened connections for this database
   * Also emit an event to entire app to be processed by other parts
   * @param id
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting database: ${id}`);
    const database = await this.get(id, true);
    try {
      await this.repository.delete(id);
      // todo: rethink
      this.redisService.removeClientInstance({ instanceId: id });
      this.logger.log('Succeed to delete database instance.');

      this.analytics.sendInstanceDeletedEvent(database);
      this.eventEmitter.emit(AppRedisInstanceEvents.Deleted, id);
    } catch (error) {
      this.logger.error(`Failed to delete database: ${id}`, error);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Bulk delete databases. Uses "delete" method and skipping error
   * Returns successfully deleted databases number
   * @param ids
   */
  async bulkDelete(ids: string[]): Promise<DeleteDatabasesResponse> {
    this.logger.log(`Deleting many database: ${ids}`);
    try {
      return {
        affected: sum(await Promise.all(ids.map(async (id) => {
          try {
            await this.delete(id);
            return 1;
          } catch (e) {
            return 0;
          }
        }))),
      };
    } catch (error) {
      this.logger.error('Failed to delete many database', error);
      throw new InternalServerErrorException();
    }
  }
}
