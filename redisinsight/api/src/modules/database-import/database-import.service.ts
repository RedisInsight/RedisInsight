import { Injectable, Logger } from '@nestjs/common';
import { isArray, get, set } from 'lodash';
import { Database } from 'src/modules/database/models/database';
import { plainToClass } from 'class-transformer';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseImportResponse } from 'src/modules/database-import/dto/database-import.response';
import { Validator } from 'class-validator';
import { ImportDatabaseDto } from 'src/modules/database-import/dto/import.database.dto';
import { classToClass } from 'src/utils';
import { DatabaseImportAnalytics } from 'src/modules/database-import/database-import.analytics';
import {
  SizeLimitExceededDatabaseImportFileException,
  NoDatabaseImportFileProvidedException, UnableToParseDatabaseImportFileException,
} from 'src/modules/database-import/exceptions';

@Injectable()
export class DatabaseImportService {
  private logger = new Logger('DatabaseImportService');

  private validator = new Validator();

  private fieldsMapSchema: Array<[string, string[]]> = [
    ['name', ['name', 'connectionName']],
    ['username', ['username']],
    ['password', ['password', 'auth']],
    ['host', ['host']],
    ['port', ['port']],
    ['db', ['db']],
    ['isCluster', ['cluster']],
  ];

  constructor(
    private readonly databaseRepository: DatabaseRepository,
    private readonly analytics: DatabaseImportAnalytics,
  ) {}

  /**
   * Import databases from the file
   * @param file
   */
  public async import(file): Promise<DatabaseImportResponse> {
    try {
      // todo: create FileValidation class
      if (!file) {
        throw new NoDatabaseImportFileProvidedException('No import file provided');
      }
      if (file?.size > 1024 * 1024 * 10) {
        throw new SizeLimitExceededDatabaseImportFileException('Import file is too big. Maximum 10mb allowed');
      }

      const items = DatabaseImportService.parseFile(file);

      if (!isArray(items) || !items?.length) {
        let filename = file?.originalname || 'import file';
        if (filename.length > 50) {
          filename = `${filename.slice(0, 50)}...`;
        }
        throw new UnableToParseDatabaseImportFileException(`Unable to parse ${filename}`);
      }

      let response = {
        total: items.length,
        success: 0,
        errors: [],
      };

      // it is very important to insert databases on-by-one to avoid db constraint errors
      await items.reduce((prev, item) => prev.finally(() => this.createDatabase(item)
        .then(() => {
          response.success += 1;
        })
        .catch((e) => {
          let error = e;
          if (isArray(e)) {
            [error] = e;
          }
          this.logger.warn(`Unable to import database: ${error?.constructor?.name || 'UncaughtError'}`, error);
          response.errors.push(error);
        })), Promise.resolve());

      this.analytics.sendImportResults(response);

      response = plainToClass(DatabaseImportResponse, response);

      return response;
    } catch (e) {
      this.logger.warn(`Unable to import databases: ${e?.constructor?.name || 'UncaughtError'}`, e);

      this.analytics.sendImportFailed(e);

      throw e;
    }
  }

  /**
   * Map data to known model, validate it and create database if possible
   * Note: will not create connection, simply create database
   * @param item
   * @private
   */
  private async createDatabase(item: any): Promise<Database> {
    const data: any = {};

    // set this is a new connection
    data.new = true

    this.fieldsMapSchema.forEach(([field, paths]) => {
      let value;

      paths.every((path) => {
        value = get(item, path);
        return value === undefined;
      });

      set(data, field, value);
    });

    // set database name if needed
    if (!data.name) {
      data.name = `${data.host}:${data.port}`;
    }

    // determine database type
    if (data.isCluster) {
      data.connectionType = ConnectionType.CLUSTER;
    } else {
      data.connectionType = ConnectionType.STANDALONE;
    }

    const dto = plainToClass(
      ImportDatabaseDto,
      // additionally replace empty strings ("") with null
      Object.keys(data)
        .reduce((acc, key) => {
          acc[key] = data[key] === '' ? null : data[key];
          return acc;
        }, {}),
    );

    await this.validator.validateOrReject(dto, {
      whitelist: true,
    });

    const database = classToClass(Database, dto);

    return this.databaseRepository.create(database);
  }

  /**
   * Try to parse file based on mimetype and known\supported formats
   * @param file
   */
  static parseFile(file): any {
    const data = file?.buffer?.toString();

    let databases;

    if (file?.mimetype === 'application/json') {
      databases = DatabaseImportService.parseJson(data);
    } else {
      databases = DatabaseImportService.parseBase64(data);
    }

    return databases;
  }

  static parseBase64(data: string): any {
    try {
      return JSON.parse((Buffer.from(data, 'base64')).toString('utf8'));
    } catch (e) {
      return null;
    }
  }

  static parseJson(data: string): any {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }
}
