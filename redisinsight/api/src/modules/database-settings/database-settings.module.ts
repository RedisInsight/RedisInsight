/* eslint-disable @typescript-eslint/no-unused-vars */
import { DynamicModule, Module, Type } from '@nestjs/common';
import { DatabaseSettingsRepository } from './repositories/database-settings.repository';
import {
  LocalDatabaseSettingsRepository,
} from './repositories/local-database-settings.repository';

const route = '/databases/:dbInstance/settings';

@Module({})
export class DatabaseSettingsModule {
  static register(
    databaseSettingsRepository: Type<DatabaseSettingsRepository> = LocalDatabaseSettingsRepository,
  ): DynamicModule {
    return {
      module: DatabaseSettingsModule,
    };
  }
}
