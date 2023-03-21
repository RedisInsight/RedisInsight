import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Recommendation {
  @ApiProperty({
    description: 'Recommendation id',
    type: String,
    example: 'id',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Recommendation name',
    type: String,
    example: 'luaScript',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Additional recommendation params',
    example: 'count: 5',
  })
  @Expose()
  params?: any;

  @ApiPropertyOptional({
    description: 'User vote',
    example: 'useful',
  })
  @Expose()
  vote?: string;

  @ApiProperty({
    description: 'Determines if recommendation was shown to user',
    type: Boolean,
    example: false,
  })
  read: boolean;

  @ApiPropertyOptional({
    description: 'flag',
    type: Boolean,
    example: 'luaScript',
  })
  @Expose()
  disabled?: boolean;
}
