/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateOrUpdateDatabaseSettingDto {
  @ApiProperty({
    description: 'Applied settings by user, by database',
  })
  @Expose()
  data: Record<string, number | string | boolean>;
}

export class DatabaseSetting {
  @ApiProperty({
    description: 'Setting id',
    type: Number,
    default: 1,
  })
  @Expose()
  id: number;

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
  data: Record<string, number | string | boolean>;

  @ApiProperty({
    description: 'Setting created date (ISO string)',
    type: Date,
    default: '2025-01-2T06:29:20.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Setting updated date (ISO string)',
    type: Date,
    default: '2025-01-2T06:29:20.000Z',
  })
  @Expose()
  updatedAt: Date;
}
