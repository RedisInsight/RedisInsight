import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Database } from 'src/modules/database/models/database';
import { Expose, Type } from 'class-transformer';
import { IsNotEmptyObject, IsOptional, ValidateNested } from 'class-validator';
import { CreateClientCertificateDto } from 'src/modules/certificate/dto/create.client-certificate.dto';
import { CreateCaCertificateDto } from 'src/modules/certificate/dto/create.ca-certificate.dto';

export class CreateDatabaseDto extends PickType(Database, [
  'host', 'port', 'name', 'db', 'username', 'password',
  'tls', 'tlsServername', 'verifyServerCert', 'sentinelMaster',
] as const) {
  @ApiPropertyOptional({
    description: 'CA Certificate',
    type: CreateCaCertificateDto,
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => CreateCaCertificateDto)
  // @Validate(CaCertCollisionValidator)
  @ValidateNested()
  caCert?: CreateCaCertificateDto;

  @ApiPropertyOptional({
    description: 'Client Certificate',
    type: CreateClientCertificateDto,
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => CreateClientCertificateDto)
  // @Validate(ClientCertCollisionValidator)
  @ValidateNested()
  clientCert?: CreateClientCertificateDto;
}
