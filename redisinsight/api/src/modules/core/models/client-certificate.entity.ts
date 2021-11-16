import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';

@Entity('client_certificate')
export class ClientCertificateEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Certificate id',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'A name for certificate.',
    type: String,
  })
  @Column({ nullable: false, unique: true })
  name: string;

  @Exclude()
  @Column({ nullable: true })
  encryption: string;

  @Exclude()
  @Column({ nullable: true })
  certificate: string;

  @Exclude()
  @Column({ nullable: true })
  key: string;

  @OneToMany(() => DatabaseInstanceEntity, (database) => database.clientCert)
  public databases: DatabaseInstanceEntity[];

  constructor(partial: Partial<ClientCertificateEntity>) {
    Object.assign(this, partial);
  }
}
