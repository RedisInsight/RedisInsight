import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';

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

  @OneToMany(() => DatabaseInstanceEntity, (database) => database.caCert)
  public databases: DatabaseInstanceEntity[];

  constructor(partial: Partial<CaCertificateEntity>) {
    Object.assign(this, partial);
  }
}
