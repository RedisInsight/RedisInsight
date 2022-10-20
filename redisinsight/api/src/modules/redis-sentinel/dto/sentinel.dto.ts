import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EndpointDto,
  TlsDto,
} from 'src/modules/instances/dto/database-instance.dto';

export class GetSentinelMastersDto extends EndpointDto {
  @ApiPropertyOptional({
    description:
      'The username, if your database is ACL enabled, otherwise leave this field empty.',
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
  // @Validate(CaCertCollisionValidator)
  // @Validate(ClientCertCollisionValidator)
  @ValidateNested()
  tls?: TlsDto;
}
