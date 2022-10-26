import {
  ApiExtraModels, ApiPropertyOptional, getSchemaPath, PickType,
} from '@nestjs/swagger';
import { Database } from 'src/modules/database/models/database';
import { Expose, Type } from 'class-transformer';
import {
  IsNotEmptyObject, IsOptional, ValidateNested,
} from 'class-validator';
import { CreateClientCertificateDto } from 'src/modules/certificate/dto/create.client-certificate.dto';
import { CreateCaCertificateDto } from 'src/modules/certificate/dto/create.ca-certificate.dto';
import { UseCaCertificateDto } from 'src/modules/certificate/dto/use.ca-certificate.dto';
import { UseClientCertificateDto } from 'src/modules/certificate/dto/use.client-certificate.dto';
import { caCertTransformer } from 'src/modules/certificate/transformers/ca-cert.transformer';
import { clientCertTransformer } from 'src/modules/certificate/transformers/client-cert.transformer';

@ApiExtraModels(CreateCaCertificateDto, UseCaCertificateDto, CreateClientCertificateDto, UseClientCertificateDto)
export class CreateDatabaseDto extends PickType(Database, [
  'host', 'port', 'name', 'db', 'username', 'password', 'nameFromProvider', 'provider',
  'tls', 'tlsServername', 'verifyServerCert', 'sentinelMaster',
] as const) {
  @ApiPropertyOptional({
    description: 'CA Certificate',
    oneOf: [
      { $ref: getSchemaPath(CreateCaCertificateDto) },
      { $ref: getSchemaPath(UseCaCertificateDto) },
    ],
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(caCertTransformer)
  @ValidateNested()
  caCert?: CreateCaCertificateDto | UseCaCertificateDto;

  @ApiPropertyOptional({
    description: 'Client Certificate',
    oneOf: [
      { $ref: getSchemaPath(CreateClientCertificateDto) },
      { $ref: getSchemaPath(UseCaCertificateDto) },
    ],
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(clientCertTransformer)
  @ValidateNested()
  clientCert?: CreateClientCertificateDto | UseClientCertificateDto;
}
