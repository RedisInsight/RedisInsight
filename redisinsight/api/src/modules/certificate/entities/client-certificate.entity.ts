import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';

@Entity('client_certificate')
export class ClientCertificateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  encryption: string;

  @Column({ nullable: true })
  certificate: string;

  @Column({ nullable: true })
  key: string;

  @OneToMany(() => DatabaseInstanceEntity, (database) => database.clientCert)
  public databases: DatabaseInstanceEntity[];

  constructor(partial: Partial<ClientCertificateEntity>) {
    Object.assign(this, partial);
  }
}
