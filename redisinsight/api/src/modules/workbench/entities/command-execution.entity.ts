import {
  Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Index,
} from 'typeorm';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';
import { RunQueryMode } from 'src/modules/workbench/dto/create-command-execution.dto';
import { Transform } from 'class-transformer';

@Entity('command_execution')
export class CommandExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
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

  @Column({ nullable: false, type: 'text' })
  command: string;

  @Column({ nullable: true })
  mode?: RunQueryMode;

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
