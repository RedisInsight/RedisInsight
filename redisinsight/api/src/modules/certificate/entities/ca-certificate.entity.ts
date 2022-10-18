import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Entity('ca_certificate')
export class CaCertificateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  encryption: string;

  @Column({ nullable: true })
  certificate: string;

  @OneToMany(() => DatabaseEntity, (database) => database.caCert)
  public databases: DatabaseEntity[];

  constructor(partial: Partial<CaCertificateEntity>) {
    Object.assign(this, partial);
  }
}
