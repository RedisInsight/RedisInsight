import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DatabaseSettingsData {
  @Expose()
  key: any;
}

export class DatabaseSettings {
  @ApiProperty({
    description: 'Database id',
    type: String,
    default: '123',
  })
  @Expose()
  databaseId: string;

  @ApiProperty({
    description: 'Applied settings by user, by database',
  })
  @Expose()
  data: DatabaseSettingsData;
}
