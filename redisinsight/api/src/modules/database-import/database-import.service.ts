import { BadRequestException, Injectable } from '@nestjs/common';
import { isArray, get, set } from 'lodash';
import { Database } from 'src/modules/database/models/database';
import { plainToClass } from 'class-transformer';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseImportResponse } from 'src/modules/database-import/dto/database-import.response';

@Injectable()
export class DatabaseImportService {
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
  ) {}

  public async import(file): Promise<DatabaseImportResponse> {
    const items = DatabaseImportService.parseFile(file);

    if (!isArray(items) || !items?.length) {
      let filename = file?.originalname || 'import file';
      if (filename.length > 50) {
        filename = `${filename.slice(0, 50)}...`;
      }
      return Promise.reject(new BadRequestException(`Unable to parse ${filename}`));
    }

    const response = {
      total: items.length,
      success: 0,
    };

    // it is very important to insert databases on-by-one to avoid db constraint errors
    await items.reduce((prev, item) => prev.finally(() => this.createDatabase(item)
      .then(() => {
        response.success += 1;
      })
      .catch(() => { /* just ignore errors */ })), Promise.resolve());

    return plainToClass(DatabaseImportResponse, response);
  }

  /**
   * Map data to known model, validate it and create database if possible
   * Note: will not create connection, simply create database
   * @param item
   * @private
   */
  private async createDatabase(item: any[]): Promise<Database> {
    const data: any = {};

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

    const database = plainToClass(Database, data);

    return this.databaseRepository.create(database);
  }

  /**
   * Try to parse file based on mimetype and known\supported formats
   * @param file
   */
  static parseFile(file): any {
    const data = file?.buffer?.toString();

    let databases;

    if (file.mimetype === 'application/json') {
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
