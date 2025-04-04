import {
  ApiExtraModels, ApiPropertyOptional, getSchemaPath, PickType,
} from '@nestjs/swagger';
import { Database } from 'src/modules/database/models/database';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmptyObject, IsOptional, ValidateNested,
} from 'class-validator';
import { NoDuplicatesByKey } from 'src/common/decorators';
import { CreateClientCertificateDto } from 'src/modules/certificate/dto/create.client-certificate.dto';
import { CreateCaCertificateDto } from 'src/modules/certificate/dto/create.ca-certificate.dto';
import { UseCaCertificateDto } from 'src/modules/certificate/dto/use.ca-certificate.dto';
import { UseClientCertificateDto } from 'src/modules/certificate/dto/use.client-certificate.dto';
import { caCertTransformer } from 'src/modules/certificate/transformers/ca-cert.transformer';
import { clientCertTransformer } from 'src/modules/certificate/transformers/client-cert.transformer';
import { CreateBasicSshOptionsDto } from 'src/modules/ssh/dto/create.basic-ssh-options.dto';
import { CreateCertSshOptionsDto } from 'src/modules/ssh/dto/create.cert-ssh-options.dto';
import { sshOptionsTransformer } from 'src/modules/ssh/transformers/ssh-options.transformer';
import { CloudDatabaseDetails } from 'src/modules/cloud/database/models/cloud-database-details';
import { Tag } from 'src/modules/tag/models/tag';

@ApiExtraModels(
  CreateCaCertificateDto, UseCaCertificateDto,
  CreateClientCertificateDto, UseClientCertificateDto,
  CreateBasicSshOptionsDto, CreateCertSshOptionsDto,
)
export class CreateDatabaseDto extends PickType(Database, [
  'host', 'port', 'name', 'db', 'username', 'password', 'timeout', 'nameFromProvider', 'provider',
  'tls', 'tlsServername', 'verifyServerCert', 'sentinelMaster', 'ssh', 'compressor', 'cloudDetails',
  'forceStandalone', 'keyNameFormat', 'tags',
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
  sshOptions?: CreateBasicSshOptionsDto | CreateCertSshOptionsDto;

  @ApiPropertyOptional({
    description: 'Cloud details',
    type: CloudDatabaseDetails,
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => CloudDatabaseDetails)
  @ValidateNested()
  cloudDetails?: CloudDatabaseDetails;

  @ApiPropertyOptional({
    description: 'Tags associated with the database.',
    type: Tag,
    isArray: true,
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @NoDuplicatesByKey('key', { message: 'Tags must not contain duplicates by key.' })
  @Type(() => Tag)
  tags?: Tag[];
}
