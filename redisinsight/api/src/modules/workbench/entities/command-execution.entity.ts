import {
  Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Index,
} from 'typeorm';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { RunQueryMode, ResultsMode } from 'src/modules/workbench/dto/create-command-execution.dto';
import { Expose, Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

@Entity('command_execution')
export class CommandExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ nullable: false })
  @Expose()
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

  @Column({ nullable: false, type: 'text' })
  @Expose()
  command: string;

  @Column({ nullable: true })
  @Expose()
  mode?: string = RunQueryMode.ASCII;

  @Column({ nullable: false, type: 'text' })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((string) => {
    try {
      return JSON.parse(string);
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  @Expose()
  result: string;

  @Column({ nullable: true })
  @Expose()
  role?: string = null;

  @Column({ nullable: true })
  @Expose()
  resultsMode?: string = ResultsMode.Default;

  @Column({ nullable: true })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((string) => {
    try {
      return JSON.parse(string);
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  @Expose()
  summary?: string;

  @Column({ nullable: true })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((string) => {
    try {
      return JSON.parse(string);
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  @Expose()
  nodeOptions?: string = null;

  @Column({ nullable: true })
  encryption: string;

  @Column({ nullable: true })
  @Expose()
  executionTime?: number;

  @Column({ nullable: true })
  @Expose()
  @IsInt()
  @Min(0)
  db?: number;

  @CreateDateColumn()
  @Index()
  @Expose()
  createdAt: Date;

  constructor(entity: Partial<CommandExecutionEntity>) {
    Object.assign(this, entity);
  }
}
