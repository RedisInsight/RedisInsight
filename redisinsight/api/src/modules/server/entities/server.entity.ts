import {
  Entity, PrimaryGeneratedColumn, CreateDateColumn, Column,
} from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('server')
export class ServerEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @CreateDateColumn({ type: 'datetime', nullable: false })
  @Expose()
  createDateTime: string;

  @Expose()
  @Column({ nullable: true })
  controlGroup: number;
}
