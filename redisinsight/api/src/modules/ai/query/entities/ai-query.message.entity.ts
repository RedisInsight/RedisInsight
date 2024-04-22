import { Expose } from 'class-transformer';
import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

export enum AiQueryMessageType {
  HumanMessage = 'HumanMessage',
  AiMessage = 'AIMessage',
}

@Entity('ai_query_message')
export class AiQueryMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ nullable: false })
  @Index()
  @Expose()
  databaseId: string;

  @Column({ nullable: false })
  @Index()
  @Expose()
  accountId: string;

  @Column({ nullable: false })
  @Expose()
  type: string;

  @Column({ nullable: false, type: 'blob' })
  @Expose()
  content: string;

  @CreateDateColumn()
  @Index()
  @Expose()
  createdAt: Date;

  @Column({ nullable: true })
  encryption: string;
}
