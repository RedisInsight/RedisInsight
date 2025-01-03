import { SessionMetadata } from 'src/common/models';
import { DatabaseSetting } from 'src/modules/database-settings/dto/database-setting.dto';

export abstract class DatabaseSettingsRepository {
  abstract create(
    sessionMetadata: SessionMetadata,
    setting: Partial<DatabaseSetting>
  ): Promise<DatabaseSetting>;

  abstract update(
    sessionMetadata: SessionMetadata,
    setting: Partial<DatabaseSetting>
  ): Promise<DatabaseSetting>;

  abstract get(sessionMetadata: SessionMetadata, id: string): Promise<DatabaseSetting>;

  abstract list(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<DatabaseSetting[]>;

  abstract delete(sessionMetadata: SessionMetadata, databaseId: string): Promise<void>;
}
