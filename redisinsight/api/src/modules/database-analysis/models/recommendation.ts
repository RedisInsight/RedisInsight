import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Recommendation {
  @ApiProperty({
    description: 'Recommendation name',
    type: String,
    example: 'luaScript',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Is recommendation actual for database',
    type: Boolean,
  })
  @Expose()
  isActual?: boolean;
}
