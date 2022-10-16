import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
  name: string;

  @ApiProperty({
    description: 'Certificate body',
    type: String,
  })
  @Expose()
  certificate: string;
}
