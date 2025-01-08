import { Expose } from 'class-transformer';

export class DatabaseSettings {
  @Expose()
  databaseId: string;

  @Expose()
  data: Record<string, number | string | boolean>;
}
