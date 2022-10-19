import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EndpointDto,
  RedisModuleDto,
  SentinelMasterDto,
} from 'src/modules/instances/dto/database-instance.dto';
import { Expose, Type } from 'class-transformer';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';
import { ConnectionType, HostingProvider } from 'src/modules/database/entities/database.entity';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

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
  @Type(() => Number)
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
  @Type(() => Number)
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
  @Expose()
  lastConnection: Date;

  @ApiPropertyOptional({
    description: 'Redis OSS Sentinel master group.',
    type: SentinelMasterDto,
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => SentinelMasterDto)
  @ValidateNested()
  sentinelMaster?: SentinelMasterDto;

  @ApiPropertyOptional({
    description: 'OSS Cluster Nodes',
    type: EndpointDto,
    isArray: true,
  })
  @Expose()
  nodes?: EndpointDto[];

  @ApiPropertyOptional({
    description: 'Loaded Redis modules.',
    type: RedisModuleDto,
    isArray: true,
  })
  @Expose()
  modules?: RedisModuleDto[];

  @ApiProperty({
    description: 'Use TLS to connect.',
    type: Boolean,
  })
  @Expose()
  @IsBoolean()
  @IsOptional()
  tls: boolean;

  @ApiPropertyOptional({
    description: 'SNI servername',
    type: String,
  })
  @Expose()
  @Type(() => String)
  @IsString()
  @IsOptional()
  tlsServername?: string;

  @ApiProperty({
    description: 'The certificate returned by the server needs to be verified.',
    type: Boolean,
    default: false,
  })
  @Expose()
  @IsOptional()
  @Type(() => Boolean)
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
  // @Validate(CaCertCollisionValidator)
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
  // @Validate(ClientCertCollisionValidator)
  @ValidateNested()
  clientCert?: ClientCertificate;
}
