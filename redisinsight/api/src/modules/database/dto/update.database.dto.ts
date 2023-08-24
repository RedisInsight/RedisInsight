import { ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, MaxLength, Min, ValidateIf, ValidateNested,
} from 'class-validator';
import { CreateCaCertificateDto } from 'src/modules/certificate/dto/create.ca-certificate.dto';
import { UseCaCertificateDto } from 'src/modules/certificate/dto/use.ca-certificate.dto';
import { Expose, Type } from 'class-transformer';
import { caCertTransformer } from 'src/modules/certificate/transformers/ca-cert.transformer';
import { Default } from 'src/common/decorators';
import { CreateClientCertificateDto } from 'src/modules/certificate/dto/create.client-certificate.dto';
import { clientCertTransformer } from 'src/modules/certificate/transformers/client-cert.transformer';
import { UseClientCertificateDto } from 'src/modules/certificate/dto/use.client-certificate.dto';
import { SentinelMaster } from 'src/modules/redis-sentinel/models/sentinel-master';
import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';
import { CreateBasicSshOptionsDto } from 'src/modules/ssh/dto/create.basic-ssh-options.dto';
import { CreateCertSshOptionsDto } from 'src/modules/ssh/dto/create.cert-ssh-options.dto';
import { sshOptionsTransformer } from 'src/modules/ssh/transformers/ssh-options.transformer';
import { Compressor } from '../entities/database.entity';

export class UpdateDatabaseDto extends CreateDatabaseDto {
  @ValidateIf((object, value) => value !== undefined)
  @IsString({ always: true })
  @MaxLength(500)
  name: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsString({ always: true })
  host: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsInt({ always: true })
  port: number;

  @ApiPropertyOptional({
    description:
      'Database username, if your database is ACL enabled, otherwise leave this field empty.',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  @Default(null)
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
  @Default(null)
  password?: string;

  @ApiPropertyOptional({
    description: 'Logical database number.',
    type: Number,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Default(null)
  db?: number;

  @ApiPropertyOptional({
    description: 'Use TLS to connect.',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Default(false)
  tls?: boolean;

  @ApiPropertyOptional({
    description: 'Use SSH to connect.',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Default(false)
  ssh?: boolean;

  @ApiPropertyOptional({
    description: 'SNI servername',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Default(null)
  tlsServername?: string;

  @ApiPropertyOptional({
    description: 'The certificate returned by the server needs to be verified.',
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ always: true })
  @Default(false)
  verifyServerCert?: boolean;

  @ApiPropertyOptional({
    description: 'CA Certificate',
    oneOf: [
      { $ref: getSchemaPath(CreateCaCertificateDto) },
      { $ref: getSchemaPath(UseCaCertificateDto) },
    ],
  })
  @IsOptional()
  @IsNotEmptyObject()
  @Type(caCertTransformer)
  @ValidateNested()
  @Default(null)
  caCert?: CreateCaCertificateDto | UseCaCertificateDto;

  @ApiPropertyOptional({
    description: 'Client Certificate',
    oneOf: [
      { $ref: getSchemaPath(CreateClientCertificateDto) },
      { $ref: getSchemaPath(UseCaCertificateDto) },
    ],
  })
  @IsOptional()
  @IsNotEmptyObject()
  @Type(clientCertTransformer)
  @ValidateNested()
  @Default(null)
  clientCert?: CreateClientCertificateDto | UseClientCertificateDto;

  @ApiPropertyOptional({
    description: 'Redis OSS Sentinel master group.',
    type: SentinelMaster,
  })
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => SentinelMaster)
  @ValidateNested()
  @Default(null)
  sentinelMaster?: SentinelMaster;

  @ApiPropertyOptional({
    description: 'SSH Options',
    oneOf: [
      { $ref: getSchemaPath(CreateBasicSshOptionsDto) },
      { $ref: getSchemaPath(CreateCertSshOptionsDto) },
    ],
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(sshOptionsTransformer)
  @ValidateNested()
  @Default(null)
  sshOptions?: CreateBasicSshOptionsDto | CreateCertSshOptionsDto;

  @ApiPropertyOptional({
    description: 'Database compressor',
    default: Compressor.NONE,
    enum: Compressor,
  })
  @Expose()
  @IsEnum(Compressor, {
    message: `compressor must be a valid enum value. Valid values: ${Object.values(
      Compressor,
    )}.`,
  })
  @IsOptional()
  compressor?: Compressor = Compressor.NONE;
}
