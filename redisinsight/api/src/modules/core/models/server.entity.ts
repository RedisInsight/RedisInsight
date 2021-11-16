import { Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('server')
export class ServerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'datetime', nullable: false })
  createDateTime: string;
}
