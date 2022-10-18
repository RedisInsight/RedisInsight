import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CaCertificate {
  @ApiProperty({
    description: 'Certificate id',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Certificate name',
    type: String,
  })
  @Expose()
  @IsNotEmpty()
  @IsString({ always: true })
  name: string;

  @ApiProperty({
    description: 'Certificate body',
    type: String,
  })
  @Expose({ groups: ['security'] })
  @IsNotEmpty()
  @IsString({ always: true })
  certificate: string;
}
