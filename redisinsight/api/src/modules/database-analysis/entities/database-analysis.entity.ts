import {
  Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Index,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { DataAsJsonString } from 'src/common/decorators';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Entity('database_analysis')
export class DatabaseAnalysisEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @Index()
  databaseId: string;

  @ManyToOne(
    () => DatabaseEntity,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'databaseId' })
  database: DatabaseEntity;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  filter: string;

  @Column({ nullable: false })
  delimiter: string;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  progress: string;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  totalKeys: string;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  totalMemory: string;

  @Column({ nullable: true, type: 'blob' })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((str) => {
    try {
      return JSON.parse(str).map((value) => ({
        ...value,
        nsp: Buffer.from(value.nsp),
      }));
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  topKeysNsp: string;

  @Column({ nullable: true, type: 'blob' })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((str) => {
    try {
      return JSON.parse(str).map((value) => ({
        ...value,
        nsp: Buffer.from(value.nsp),
      }));
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  topMemoryNsp: string;

  @Column({ nullable: true, type: 'blob' })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((str) => {
    try {
      return JSON.parse(str).map((value) => ({
        ...value,
        name: Buffer.from(value.name),
      }));
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  topKeysLength: string;

  @Column({ nullable: true, type: 'blob' })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((str) => {
    try {
      return JSON.parse(str).map((value) => ({
        ...value,
        name: Buffer.from(value.name),
      }));
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  topKeysMemory: string;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  expirationGroups: string;

  @Column({ nullable: true })
  encryption: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  constructor(entity: Partial<DatabaseAnalysisEntity>) {
    Object.assign(this, entity);
  }
}
