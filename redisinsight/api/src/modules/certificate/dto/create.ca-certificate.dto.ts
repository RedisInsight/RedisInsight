import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCaCertificateDto {
  @ApiProperty({
    description: 'Name for CA Certificate',
    type: String,
  })
  @IsNotEmpty()
  @IsString({ always: true })
  name: string;

  @ApiProperty({
    description: 'Body of the CA Certificate',
    type: String,
  })
  @IsNotEmpty()
  @IsString({ always: true })
  certificate: string;
}
