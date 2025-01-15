import { Expose } from 'class-transformer';

export class DatabaseSettings {
  @Expose()
  databaseId: string;

  @Expose()
  data: DatabaseSettingsData;
}

class DatabaseSettingsData {
  @Expose()
  key: string;
}
