import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { DataAsJsonString } from 'src/common/decorators';
import { Expose, Transform } from 'class-transformer';
import { SentinelMaster } from 'src/modules/redis-sentinel/models/sentinel-master';

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
  @Transform((_, model) => (
    model?.sentinelMaster?.name
  ), { toClassOnly: true })
  sentinelMasterName: string;

  @Expose()
  @Column({ nullable: true })
  @Transform((_, model) => (
    model?.sentinelMaster?.username
  ), { toClassOnly: true })
  sentinelMasterUsername: string;

  @Expose()
  @Column({ nullable: true })
  @Transform((_, model) => (
    model?.sentinelMaster?.password
  ), { toClassOnly: true })
  sentinelMasterPassword: string;

  @Expose()
  @Transform((_, entity) => {
    if (entity?.sentinelMasterName) {
      return {
        name: entity?.sentinelMasterName,
        username: entity?.sentinelMasterUsername,
        password: entity?.sentinelMasterPassword,
      };
    }

    return undefined;
  }, { toPlainOnly: true })
  @Transform(() => undefined, { toClassOnly: true })
  sentinelMaster: SentinelMaster;

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
  @Column({ nullable: true, default: '[]' })
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

  @Expose()
  @Column({ nullable: true })
  new: boolean;
}
