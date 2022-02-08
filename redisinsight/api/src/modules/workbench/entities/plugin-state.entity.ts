import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';

@Entity('plugin_state')
export class PluginStateEntity {
  @PrimaryColumn()
  commandExecutionId: string;

  @ManyToOne(
    () => CommandExecutionEntity,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'commandExecutionId' })
  commandExecution: CommandExecutionEntity;

  @PrimaryColumn()
  visualizationId: string;

  @Column({ nullable: false, type: 'text' })
  @Transform((object) => JSON.stringify(object), { toClassOnly: true })
  @Transform((string) => {
    try {
      return JSON.parse(string);
    } catch (e) {
      return undefined;
    }
  }, { toPlainOnly: true })
  state: string;

  @Column({ nullable: true })
  encryption: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(entity: Partial<PluginStateEntity>) {
    Object.assign(this, entity);
  }
}
