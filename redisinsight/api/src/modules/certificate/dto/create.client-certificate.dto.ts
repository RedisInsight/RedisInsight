import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClientCertificateDto {
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
  certificate: string;
}
