import {
  Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Index,
} from 'typeorm';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';
import { Transform } from 'class-transformer';

@Entity('database_analysis')
export class DatabaseAnalysisEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @Index()
  databaseId: string;

  @ManyToOne(
    () => DatabaseInstanceEntity,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'databaseId' })
  database: DatabaseInstanceEntity;

  @Column({ nullable: true, type: 'blob' })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  filter: string;

  @Column({ nullable: false })
  delimiter: string;

  @Column({ nullable: true, type: 'blob' })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  progress: string;

  @Column({ nullable: true, type: 'blob' })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  totalKeys: string;

  @Column({ nullable: true, type: 'blob' })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
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
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
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
