import { ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import {
  IsBoolean,
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
}
