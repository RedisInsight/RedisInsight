import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { RdiType } from 'src/modules/rdi/models';

@Entity('rdi')
export class RdiEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ nullable: false })
  type: RdiType;

  @Expose()
  @Column({ nullable: true })
  url: string;

  @Expose()
  @Column({ nullable: true })
  host: string;

  @Expose()
  @Column({ nullable: true })
  port: number;

  @Expose()
  @Column({ nullable: false })
  name: string;

  @Expose()
  @Column({ nullable: true })
  username: string;

  @Expose()
  @Column({ nullable: true })
  password: string;

  @Expose()
  @Column({ type: 'datetime', nullable: true })
  lastConnection: Date;
}
