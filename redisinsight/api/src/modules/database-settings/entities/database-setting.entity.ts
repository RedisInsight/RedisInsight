/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { DataAsJsonString } from 'src/common/decorators';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Entity('database-settings')
export class DatabaseSettingsEntity {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ nullable: false })
  @Index({ unique: true })
  @Expose()
  databaseId: string;

  @ManyToOne(
    () => DatabaseEntity,
    { nullable: false, onDelete: 'CASCADE', },
  )
  @JoinColumn({ name: 'databaseId' })
  database: DatabaseEntity;

  @ApiProperty({
    description: 'Applied settings by user, by database',
    })
  @Column({ nullable: true })
  @DataAsJsonString()
  @Expose()
  data: Record<string, number | string | boolean>;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  constructor(entity: Partial<DatabaseSettingsEntity>) {
    Object.assign(this, entity);
  }
}
