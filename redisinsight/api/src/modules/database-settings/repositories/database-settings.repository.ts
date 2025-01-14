import { SessionMetadata } from 'src/common/models';
import { DatabaseSetting as DatabaseSettingDto } from '../dto/database-setting.dto';
import { DatabaseSettings as DatabaseSettingsModel } from '../models/database-settings';

export abstract class DatabaseSettingsRepository {
  abstract createOrUpdate(
    sessionMetadata: SessionMetadata,
    setting: Partial<DatabaseSettingDto>
  ): Promise<DatabaseSettingsModel>;

  abstract get(sessionMetadata: SessionMetadata, databaseId: string): Promise<DatabaseSettingsModel>;

  abstract delete(sessionMetadata: SessionMetadata, databaseId: string): Promise<void>;
}
