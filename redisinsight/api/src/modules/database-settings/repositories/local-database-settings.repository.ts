import { SessionMetadata } from 'src/common/models';
import { DatabaseSettingsRepository } from './database-settings.repository';
import { DatabaseSetting } from '../dto/database-setting.dto';

export class LocalDatabaseSettingsRepository extends DatabaseSettingsRepository {
  create(sessionMetadata: SessionMetadata, setting: Partial<DatabaseSetting>): Promise<DatabaseSetting> {
    throw new Error('Method not implemented.');
  }

  update(sessionMetadata: SessionMetadata, setting: Partial<DatabaseSetting>): Promise<DatabaseSetting> {
    throw new Error('Method not implemented.');
  }

  get(sessionMetadata: SessionMetadata, id: string): Promise<DatabaseSetting> {
    throw new Error('Method not implemented.');
  }

  list(sessionMetadata: SessionMetadata, databaseId: string): Promise<DatabaseSetting[]> {
    throw new Error('Method not implemented.');
  }

  delete(sessionMetadata: SessionMetadata, databaseId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
