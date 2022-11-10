import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Recommendation {
  @ApiProperty({
    description: 'Recommendation name',
    type: String,
    example: 'luaScript',
  })
  @Expose()
  name: string;
}
