import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { DataAsJsonString } from 'src/common/decorators';
import { Expose } from 'class-transformer';

export enum HostingProvider {
  UNKNOWN = 'UNKNOWN',
  LOCALHOST = 'LOCALHOST',
  RE_CLUSTER = 'RE_CLUSTER',
  RE_CLOUD = 'RE_CLOUD',
  AZURE = 'AZURE',
  AWS = 'AWS',
  GOOGLE = 'GOOGLE',
}

export enum ConnectionType {
  STANDALONE = 'STANDALONE',
  CLUSTER = 'CLUSTER',
  SENTINEL = 'SENTINEL',
}

@Entity('database_instance')
export class DatabaseEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ nullable: false })
  host: string;

  @Expose()
  @Column({ nullable: false })
  port: number;

  @Expose()
  @Column({ nullable: false })
  name: string;

  @Expose()
  @Column({ nullable: true })
  db: number;

  @Expose()
  @Column({ nullable: true })
  username: string;

  @Expose()
  @Column({ nullable: true })
  password: string;

  @Expose()
  @Column({ nullable: true })
  sentinelMasterName: string;

  @Expose()
  @Column({ nullable: true })
  sentinelMasterUsername: string;

  @Expose()
  @Column({ nullable: true })
  sentinelMasterPassword: string;

  @Expose()
  @Column({ nullable: true })
  tls: boolean;

  @Expose()
  @Column({ nullable: true })
  tlsServername?: string;

  @Expose()
  @Column({ nullable: true })
  verifyServerCert: boolean;

  @Expose()
  @ManyToOne(
    () => CaCertificateEntity,
    (caCertificate) => caCertificate.databases,
    {
      eager: true,
      onDelete: 'SET NULL',
    },
  )
  caCert: CaCertificateEntity;

  @Expose()
  @ManyToOne(
    () => ClientCertificateEntity,
    (clientCertificate) => clientCertificate.databases,
    {
      eager: true,
      onDelete: 'SET NULL',
    },
  )
  clientCert: ClientCertificateEntity;

  @Expose()
  @Column({
    nullable: false,
    default: ConnectionType.STANDALONE,
  })
  connectionType: ConnectionType;

  @Expose()
  @Column({ nullable: true })
  nameFromProvider: string;

  @Expose()
  @Column({ nullable: true })
  @DataAsJsonString()
  nodes: string;

  @Expose()
  @Column({ type: 'datetime', nullable: true })
  lastConnection: Date;

  @Expose()
  @Column({
    nullable: true,
    default: HostingProvider.UNKNOWN,
  })
  provider: string;

  @Expose()
  @Column({ nullable: false, default: '[]' })
  @DataAsJsonString()
  modules: string;

  @Column({ nullable: true })
  encryption: string;

  constructor(partial: Partial<DatabaseEntity>) {
    Object.assign(this, partial);
  }
}
