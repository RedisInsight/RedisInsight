import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';
import { ConnectionType, HostingProvider } from 'src/modules/database/entities/database.entity';
import {
  IsBoolean, IsEnum,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { SentinelMaster } from 'src/modules/redis-sentinel/models/sentinel-master';
import { Endpoint } from 'src/common/models';
import { AdditionalRedisModule } from 'src/modules/database/models/additional.redis.module';

export class Database {
  @ApiProperty({
    description: 'Database id.',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description:
      'The hostname of your Redis database, for example redis.acme.com.'
      + ' If your Redis server is running on your local machine, you can enter either 127.0.0.1 or localhost.',
    type: String,
    default: 'localhost',
  })
  @Expose()
  @IsNotEmpty()
  @IsString({ always: true })
  host: string;

  @ApiProperty({
    description: 'The port your Redis database is available on.',
    type: Number,
    default: 6379,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt({ always: true })
  port: number;

  @ApiProperty({
    description: 'A name for your Redis database.',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @MaxLength(500)
  name: string;

  @ApiPropertyOptional({
    description: 'Logical database number.',
    type: Number,
  })
  @Expose()
  @IsInt()
  @Min(0)
  @IsOptional()
  db?: number;

  @ApiPropertyOptional({
    description:
      'Database username, if your database is ACL enabled, otherwise leave this field empty.',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description:
      'The password, if any, for your Redis database. '
      + 'If your database doesn’t require a password, leave this field empty.',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Connection Type',
    default: ConnectionType.STANDALONE,
    enum: ConnectionType,
  })
  @Expose()
  @IsEnum(ConnectionType)
  connectionType: ConnectionType;

  @ApiPropertyOptional({
    description: 'The database name from provider',
  })
  @Expose()
  @IsOptional()
  @IsString()
  nameFromProvider?: string | null;

  @ApiPropertyOptional({
    description: 'The redis database hosting provider',
    example: HostingProvider.RE_CLOUD,
  })
  @Expose()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({
    description: 'Time of the last connection to the database.',
    type: String,
    format: 'date-time',
    example: '2021-01-06T12:44:39.000Z',
  })
  @Expose()
  lastConnection: Date;

  @ApiPropertyOptional({
    description: 'Redis OSS Sentinel master group.',
    type: SentinelMaster,
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => SentinelMaster)
  @ValidateNested()
  sentinelMaster?: SentinelMaster;

  @ApiPropertyOptional({
    description: 'OSS Cluster Nodes',
    type: Endpoint,
    isArray: true,
  })
  @Expose()
  nodes?: Endpoint[];

  @ApiPropertyOptional({
    description: 'Loaded Redis modules.',
    type: AdditionalRedisModule,
    isArray: true,
  })
  @Expose()
  modules?: AdditionalRedisModule[];

  @ApiPropertyOptional({
    description: 'Use TLS to connect.',
    type: Boolean,
  })
  @Expose()
  @IsBoolean()
  @IsOptional()
  tls?: boolean;

  @ApiPropertyOptional({
    description: 'SNI servername',
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tlsServername?: string;

  @ApiPropertyOptional({
    description: 'The certificate returned by the server needs to be verified.',
    type: Boolean,
    default: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean({ always: true })
  verifyServerCert?: boolean;

  @ApiPropertyOptional({
    description: 'CA Certificate',
    type: CaCertificate,
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => CaCertificate)
  @ValidateNested()
  caCert?: CaCertificate;

  @ApiPropertyOptional({
    description: 'Client Certificate',
    type: ClientCertificate,
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => ClientCertificate)
  @ValidateNested()
  clientCert?: ClientCertificate;

  @ApiPropertyOptional({
    description: 'A new created connection',
    type: Boolean,
    default: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean({ always: true })
  new?: boolean;
}
