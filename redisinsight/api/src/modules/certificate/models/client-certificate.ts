import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class ClientCertificate {
  @ApiProperty({
    description: 'Certificate id',
    type: String,
  })
  @Expose()
  @IsNotEmpty()
  @IsString({ always: true })
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

  @ApiProperty({
    description: 'Key body',
    type: String,
  })
  @Expose({ groups: ['security'] })
  @IsNotEmpty()
  @IsString({ always: true })
  key: string;
}
