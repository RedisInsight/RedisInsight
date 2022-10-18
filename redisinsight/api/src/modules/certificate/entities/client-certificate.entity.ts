import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

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

  @OneToMany(() => DatabaseEntity, (database) => database.clientCert)
  public databases: DatabaseEntity[];

  constructor(partial: Partial<ClientCertificateEntity>) {
    Object.assign(this, partial);
  }
}
