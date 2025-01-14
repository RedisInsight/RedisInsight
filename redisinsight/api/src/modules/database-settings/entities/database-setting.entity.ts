/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  Column, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';
import { DataAsJsonString } from 'src/common/decorators';

@Entity('database-settings')
export class DatabaseSettingsEntity {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ nullable: false })
  @Index({ unique: true })
  @Expose()
  databaseId: string;

  @ApiProperty({
    description: 'Applied settings by user, by database',
  })
  @Column({ nullable: true })
  @DataAsJsonString()
  @Expose()
  data: Record<string, number | string | boolean>;

  constructor(entity: Partial<DatabaseSettingsEntity>) {
    Object.assign(this, entity);
  }
}
