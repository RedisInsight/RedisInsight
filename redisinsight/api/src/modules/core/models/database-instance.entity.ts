import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { CaCertificateEntity } from 'src/modules/core/models/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/core/models/client-certificate.entity';

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
export class DatabaseInstanceEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Database id.',
    type: String,
  })
  id: string;

  @ApiProperty({
    description:
      'The hostname of your Redis database, for example redis.acme.com.',
    type: String,
  })
  @Column({ nullable: false })
  host: string;

  @ApiProperty({
    description: 'The port your Redis database is available on.',
    type: Number,
  })
  @Column({ nullable: false })
  port: number;

  @ApiProperty({
    description: 'A name for Redis database.',
    type: String,
  })
  @Column({ nullable: false })
  name: string;

  @ApiPropertyOptional({
    description: 'Logical database number.',
    type: Number,
    example: 0,
  })
  @Column({ nullable: true })
  db: number;

  @ApiPropertyOptional({
    description: 'The username, if your database is ACL enabled.',
    type: String,
  })
  @Column({ nullable: true })
  username: string;

  @ApiPropertyOptional({
    description: 'The password for your Redis database.',
    type: String,
  })
  @Column({ nullable: true })
  password: string;

  @ApiPropertyOptional({
    description:
      'Sentinel master group name. Identifies a group of Redis instances composed of a master and one or more slaves.',
    type: String,
  })
  @Column({ nullable: true })
  sentinelMasterName: string;

  @ApiPropertyOptional({
    description: 'The username, if your Sentinel master is ACL enabled.',
    type: String,
  })
  @Column({ nullable: true })
  sentinelMasterUsername: string;

  @ApiPropertyOptional({
    description: 'The password for your Redis Sentinel master.',
    type: String,
  })
  @Column({ nullable: true })
  sentinelMasterPassword: string;

  @ApiProperty({
    description: 'Use TLS to connect.',
    type: Boolean,
  })
  @Column({ nullable: false })
  tls: boolean;

  @ApiProperty({
    description: 'The certificate returned by the server needs to be verified.',
    type: Boolean,
  })
  @Column({ nullable: false })
  verifyServerCert: boolean;

  @ApiProperty({
    description: 'CA Certificate.',
    type: () => CaCertificateEntity,
  })
  @ManyToOne(
    () => CaCertificateEntity,
    (caCertificate) => caCertificate.databases,
    {
      eager: true,
      onDelete: 'SET NULL',
    },
  )
  caCert: CaCertificateEntity;

  @ApiProperty({
    description: 'Client Certificate.',
    type: () => ClientCertificateEntity,
  })
  @ManyToOne(
    () => ClientCertificateEntity,
    (clientCertificate) => clientCertificate.databases,
    {
      eager: true,
      onDelete: 'SET NULL',
    },
  )
  clientCert: ClientCertificateEntity;

  @ApiProperty({
    description: 'Connection Type',
    default: ConnectionType.STANDALONE,
    enum: ConnectionType,
  })
  @Column({
    nullable: false,
    default: ConnectionType.STANDALONE,
  })
  connectionType: ConnectionType;

  @ApiPropertyOptional({
    description: 'The database name from provider',
    type: String,
  })
  @Column({ nullable: true })
  nameFromProvider: string;

  @ApiPropertyOptional({
    description: 'OSS Cluster nodes.',
    type: String,
  })
  @Column({ nullable: true })
  nodes: string;

  @ApiProperty({
    description: 'Time of the last connection to the database',
    type: String,
    format: 'date-time',
    example: '2021-01-06T12:44:39.000Z',
  })
  @Column({ type: 'datetime', nullable: true })
  lastConnection: Date;

  @ApiProperty({
    description: 'Database Provider',
    type: String,
  })
  @Column({
    nullable: true,
    default: HostingProvider.UNKNOWN,
  })
  provider: string;

  @ApiProperty({
    description: 'Loaded Redis modules.',
    type: String,
  })
  @Column({ nullable: false, default: '[]' })
  modules: string;

  @Column({ nullable: true })
  encryption: string;

  constructor(partial: Partial<DatabaseInstanceEntity>) {
    Object.assign(this, partial);
  }
}
