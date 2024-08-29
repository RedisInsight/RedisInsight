import { Expose } from 'class-transformer';
import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';
import { DataAsJsonString } from 'src/common/decorators';
import { Nullable } from 'src/common/constants';
import { AiTools } from '../models';

@Entity('ai_message')
export class AiMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ nullable: true })
  @Index()
  @Expose()
  databaseId: Nullable<string>;

  @Column({ nullable: false })
  @Index()
  @Expose()
  accountId: string;

  @Column({ nullable: true })
  @Expose()
  conversationId: string;

  @Expose()
  @Column({
    nullable: false,
    default: AiTools.General,
  })
  tool: AiTools;

  @Column({ nullable: false })
  @Expose()
  type: string;

  @Column({ nullable: false, type: 'blob' })
  @Expose()
  content: string;

  @Column({ nullable: true, type: 'blob' })
  @DataAsJsonString()
  @Expose()
  steps: string;

  @CreateDateColumn()
  @Index()
  @Expose()
  createdAt: Date;

  @Column({ nullable: true })
  encryption: string;
}
