import {
  Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Index,
} from 'typeorm';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';
import { RunQueryMode } from 'src/modules/workbench/dto/create-command-execution.dto';
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
  @Transform((object) => Buffer.from(JSON.stringify(object)), { toClassOnly: true })
  @Transform((buf) => {
    try {
      const data = JSON.parse(buf.toString());
      return data.map((value) => ({
        ...value,
        nsp: Buffer.from(value.nsp),
      }));
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  topKeysNsp: Buffer;

  @Column({ nullable: true, type: 'blob' })
  @Transform((object) => Buffer.from(JSON.stringify(object)), { toClassOnly: true })
  @Transform((buf) => {
    try {
      const data = JSON.parse(buf.toString());
      return data.map((value) => ({
        ...value,
        nsp: Buffer.from(value.nsp),
      }));
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  topMemoryNsp: Buffer;

  @Column({ nullable: true })
  encryption: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  constructor(entity: Partial<DatabaseAnalysisEntity>) {
    Object.assign(this, entity);
  }
}
