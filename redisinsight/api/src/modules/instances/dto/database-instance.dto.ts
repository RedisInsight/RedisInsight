import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClientCertCollisionValidator, CaCertCollisionValidator } from 'src/validators';
import { RedisModules } from 'src/constants';
import { ConnectionType, HostingProvider } from 'src/modules/core/models/database-instance.entity';

export class EndpointDto {
  @ApiProperty({
    description:
      'The hostname of your Redis database, for example redis.acme.com.'
      + ' If your Redis server is running on your local machine, you can enter either 127.0.0.1 or localhost.',
    type: String,
    default: 'localhost',
  })
  @IsNotEmpty()
  @IsString({ always: true })
  host: string;

  @ApiProperty({
    description: 'The port your Redis database is available on.',
    type: Number,
    default: 6379,
  })
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  port: number;
}

export class RedisModuleDto {
  @ApiProperty({
    description: 'Name of the module.',
    type: String,
    example: RedisModules.RediSearch,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Integer representation of a module version.',
    type: Number,
    example: 20008,
  })
  version?: number;

  @ApiPropertyOptional({
    description: 'Semantic versioning representation of a module version.',
    type: String,
    example: '2.0.8',
  })
  semanticVersion?: string;
}

export class CaCertDto {
  @ApiProperty({
    description: 'Name for your CA Certificate',
    type: String,
  })
  @IsNotEmpty()
  @IsString({ always: true })
  name: string;

  @ApiProperty({
    description: 'Text of the CA Certificate',
    type: String,
  })
  @IsNotEmpty()
  @IsString({ always: true })
  cert: string;
}

export class ClientCertPairDto {
  @ApiProperty({
    description: 'Name for your Client Certificate',
    type: String,
  })
  @IsNotEmpty()
  @IsString({ always: true })
  name: string;

  @ApiProperty({
    description: 'Text of the Private key',
    type: String,
  })
  @IsNotEmpty()
  @IsString({ always: true })
  key: string;

  @ApiProperty({
    description: 'Text of the Certificate',
    type: String,
  })
  @IsNotEmpty()
  @IsString({ always: true })
  cert: string;
}

export class BasicTlsDto {
  @ApiProperty({
    description: 'The certificate returned by the server needs to be verified.',
    type: Boolean,
    default: false,
  })
  @IsDefined()
  @Type(() => Boolean)
  @IsBoolean({ always: true })
  verifyServerCert: boolean;

  @ApiPropertyOptional({
    description: 'Id of Ca Certificate',
    type: String,
  })
  @IsNotEmpty()
  @IsString({ always: true })
  @IsOptional()
  caCertId?: string;

  @ApiPropertyOptional({
    description:
      'Id of Client certificate and private key pair for TLS Mutual authentication.',
    type: String,
  })
  @IsNotEmpty()
  @IsString({ always: true })
  @IsOptional()
  clientCertPairId?: string;
}

export class TlsDto extends BasicTlsDto {
  @ApiPropertyOptional({
    description:
      'If the server needs to be authenticated, pass a CA Certificate.',
    type: CaCertDto,
  })
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => CaCertDto)
  @IsOptional()
  newCaCert?: CaCertDto;

  @ApiPropertyOptional({
    description:
      'Client certificate and private key pair for TLS Mutual authentication.',
    type: ClientCertPairDto,
  })
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => ClientCertPairDto)
  @IsOptional()
  newClientCertPair?: ClientCertPairDto;
}

export class SentinelMasterDto {
  @ApiProperty({
    description:
      'Sentinel master group name. Identifies a group of Redis instances composed of a master and one or more slaves.',
    type: String,
  })
  @IsString({ always: true })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Sentinel username, if your database is ACL enabled, otherwise leave this field empty.',
    type: String,
  })
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description:
      'The password for your Redis Sentinel master. '
      + 'If your master doesn’t require a password, leave this field empty.',
    type: String,
  })
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  password?: string;
}

export class ConnectionOptionsDto extends EndpointDto {
  @ApiPropertyOptional({
    description: 'Logical database number.',
    type: Number,
    example: 0,
  })
  @IsInt()
  @Max(15)
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  db?: number;

  @ApiPropertyOptional({
    description:
      'Database username, if your database is ACL enabled, otherwise leave this field empty.',
    type: String,
  })
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
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'Use TLS to connect.',
    type: TlsDto,
  })
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => TlsDto)
  @Validate(CaCertCollisionValidator)
  @Validate(ClientCertCollisionValidator)
  @ValidateNested()
  tls?: TlsDto;

  @ApiPropertyOptional({
    description: 'Redis OSS Sentinel master groups.',
    type: SentinelMasterDto,
  })
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => SentinelMasterDto)
  @ValidateNested()
  sentinelMaster?: SentinelMasterDto;
}

export class DatabaseInstanceResponse {
  @ApiProperty({
    description: 'Database instance id.',
    type: String,
  })
  id: string;

  @ApiProperty({
    description:
      'The hostname of your Redis database, for example redis.acme.com.'
      + ' If your Redis server is running on your local machine, you can enter either 127.0.0.1 or localhost.',
    type: String,
    default: 'localhost',
  })
  host: string;

  @ApiProperty({
    description: 'The port your Redis database is available on.',
    type: Number,
    default: 6379,
  })
  port: number;

  @ApiProperty({
    description: 'A name for your Redis database.',
    type: String,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Logical database number.',
    type: Number,
  })
  db?: number;

  @ApiPropertyOptional({
    description:
      'Database username, if your database is ACL enabled, otherwise leave this field empty.',
    type: String,
  })
  username?: string;

  @ApiPropertyOptional({
    description:
      'The password, if any, for your Redis database. '
      + 'If your database doesn’t require a password, leave this field empty.',
    type: String,
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Use TLS to connect.',
    type: BasicTlsDto,
  })
  tls?: BasicTlsDto;

  @ApiProperty({
    description: 'Connection Type',
    default: ConnectionType.STANDALONE,
    enum: ConnectionType,
  })
  connectionType: ConnectionType;

  @ApiProperty({
    description: 'The database name from provider',
  })
  nameFromProvider: string | null;

  @ApiProperty({
    description: 'The redis database hosting provider',
    example: HostingProvider.RE_CLOUD,
  })
  provider: string;

  @ApiProperty({
    description: 'Time of the last connection to the database.',
    type: String,
    format: 'date-time',
    example: '2021-01-06T12:44:39.000Z',
  })
  lastConnection: Date;

  @ApiPropertyOptional({
    description: 'Redis OSS Sentinel master group.',
    type: SentinelMasterDto,
  })
  sentinelMaster?: SentinelMasterDto;

  @ApiPropertyOptional({
    description: 'OSS Cluster Nodes',
    type: EndpointDto,
    isArray: true,
  })
  endpoints?: EndpointDto[];

  @ApiPropertyOptional({
    description: 'Loaded Redis modules.',
    type: RedisModuleDto,
    isArray: true,
  })
  modules: RedisModuleDto[];
}

export class DeleteDatabaseInstanceDto {
  @ApiProperty({
    description: 'The unique ID of the database requested',
    type: String,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  ids: string[];
}

export class DeleteDatabaseInstanceResponse {
  @ApiProperty({
    description: 'Number of affected database instances',
    type: Number,
  })
  affected: number;
}

export class AddDatabaseInstanceDto extends ConnectionOptionsDto {
  @ApiProperty({
    description: 'A name for your Redis database.',
    type: String,
  })
  @IsString({ always: true })
  @IsNotEmpty()
  @MaxLength(500)
  name: string;

  nameFromProvider?: string;

  provider?: string;
}

export class ConnectToRedisDatabaseIndexDto {
  @ApiPropertyOptional({
    description: 'Databases index. Redis databases are numbered from 0 to 15.',
    type: Number,
    minimum: 0,
    maximum: 15,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @Max(15)
  @Type(() => Number)
  @IsNotEmpty()
  dbNumber?: number;
}

export class RenameDatabaseInstanceDto {
  @ApiProperty({
    description: 'New  name',
    type: String,
  })
  @IsString({ always: true })
  @IsNotEmpty()
  @MaxLength(500)
  newName: string;
}

export class RenameDatabaseInstanceResponse {
  @ApiProperty({
    description: 'Old name',
    type: String,
  })
  oldName: string;

  @ApiProperty({
    description: 'New name',
    type: String,
  })
  newName: string;
}
