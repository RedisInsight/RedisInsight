import {
  Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { DataAsJsonString } from 'src/common/decorators';
import { Expose, Transform, Type } from 'class-transformer';
import { SentinelMaster } from 'src/modules/redis-sentinel/models/sentinel-master';
import { SshOptionsEntity } from 'src/modules/ssh/entities/ssh-options.entity';
import { CloudDatabaseDetailsEntity } from 'src/modules/cloud/autodiscovery/entities/cloud-database-details.entity';

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
  NOT_CONNECTED = 'NOT CONNECTED',
}

export enum Compressor {
  NONE = 'NONE',
  GZIP = 'GZIP',
  ZSTD = 'ZSTD',
  LZ4 = 'LZ4',
  SNAPPY = 'SNAPPY',
  Brotli = 'Brotli',
  PHPGZCompress = 'PHPGZCompress',
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
  timeout: number;

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

  @Expose()
  @Column({ nullable: true })
  ssh: boolean;

  @Expose()
  @OneToOne(
    () => SshOptionsEntity,
    (sshOptions) => sshOptions.database,
    {
      eager: true,
      onDelete: 'CASCADE',
      cascade: true,
    },
  )
  @Type(() => SshOptionsEntity)
  sshOptions: SshOptionsEntity;

  @Expose()
  @OneToOne(
    () => CloudDatabaseDetailsEntity,
    (cloudDetails) => cloudDetails.database,
    {
      eager: true,
      onDelete: 'CASCADE',
      cascade: true,
    },
  )
  @Type(() => CloudDatabaseDetailsEntity)
  cloudDetails: CloudDatabaseDetailsEntity;

  @Expose()
  @Column({
    nullable: false,
    default: Compressor.NONE,
  })
  compressor: Compressor;

  @Expose()
  @Column({ nullable: true })
  version: string;
}
