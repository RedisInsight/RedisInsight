import {
  Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, JoinColumn,
} from 'typeorm';
import { DataAsJsonString } from 'src/common/decorators';
import { Expose, Transform } from 'class-transformer';
import { SentinelMaster } from 'src/modules/redis-sentinel/models/sentinel-master';
import { ISshOptions } from '../../../common/interfaces/entity-interfaces';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { CloudDatabaseDetailsEntity } from 'src/modules/cloud/database/entities/cloud-database-details.entity';
import { IDatabase } from '../interfaces/database.interface';

// Keep and export the enums here
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

export enum HostingProvider {
  RE_CLUSTER = 'RE_CLUSTER',
  RE_CLOUD = 'RE_CLOUD',
  REDIS_STACK = 'REDIS_STACK',
  REDIS_ENTERPRISE = 'REDIS_ENTERPRISE',
  AZURE_CACHE = 'AZURE_CACHE',
  AZURE_CACHE_REDIS_ENTERPRISE = 'AZURE_CACHE_REDIS_ENTERPRISE',
  REDIS_COMMUNITY_EDITION = 'REDIS_COMMUNITY_EDITION',
  AWS_ELASTICACHE = 'AWS_ELASTICACHE',
  AWS_MEMORYDB = 'AWS_MEMORYDB',
  VALKEY = 'VALKEY',
  MEMORYSTORE = 'MEMORYSTORE',
  DRAGONFLY = 'DRAGONFLY',
  KEYDB = 'KEYDB',
  GARNET = 'GARNET',
  KVROCKS = 'KVROCKS',
  REDICT = 'REDICT',
  UPSTASH = 'UPSTASH',
  UNKNOWN_LOCALHOST = 'UNKNOWN_LOCALHOST',
  UNKNOWN = 'UNKNOWN',
}

@Entity('database_instance')
export class DatabaseEntity implements IDatabase {
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
  @Transform((_, obj) => (
    obj?.sentinelMaster?.name
  ), { toClassOnly: true })
  sentinelMasterName: string;

  @Expose()
  @Column({ nullable: true })
  @Transform((_, obj) => (
    obj?.sentinelMaster?.username
  ), { toClassOnly: true })
  sentinelMasterUsername: string;

  @Expose()
  @Column({ nullable: true })
  @Transform((_, obj) => (
    obj?.sentinelMaster?.password
  ), { toClassOnly: true })
  sentinelMasterPassword: string;

  @Expose()
  @Transform((_, obj) => {
    if (obj?.sentinelMasterName) {
      return {
        name: obj?.sentinelMasterName,
        username: obj?.sentinelMasterUsername,
        password: obj?.sentinelMasterPassword,
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

  @OneToOne(
    'CloudDatabaseDetailsEntity',
    'database_instance',
    {
      cascade: true,
      nullable: true,
    },
  )
  cloudDetails?: CloudDatabaseDetailsEntity;

  @ManyToOne(
    type => CaCertificateEntity,
    caCertificate => caCertificate.databases,
    {
      eager: true,
      onDelete: 'SET NULL',
    },
  )
  caCert: CaCertificateEntity;

  @ManyToOne(
    type => ClientCertificateEntity,
    clientCertificate => clientCertificate.databases,
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
  @OneToOne('SshOptionsEntity', 'database_instance', {
    cascade: true,
    nullable: true,
  })
  sshOptions?: ISshOptions;

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