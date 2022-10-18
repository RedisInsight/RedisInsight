import {
  Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Index,
} from 'typeorm';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { RunQueryMode, ResultsMode } from 'src/modules/workbench/dto/create-command-execution.dto';
import { Transform } from 'class-transformer';

@Entity('command_execution')
export class CommandExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
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
  command: string;

  @Column({ nullable: true })
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
  result: string;

  @Column({ nullable: true })
  role?: string;

  @Column({ nullable: true })
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
  nodeOptions?: string;

  @Column({ nullable: true })
  encryption: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  constructor(entity: Partial<CommandExecutionEntity>) {
    Object.assign(this, entity);
  }
}
