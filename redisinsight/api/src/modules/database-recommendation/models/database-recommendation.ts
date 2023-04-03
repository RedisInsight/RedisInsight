import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DatabaseRecommendation {
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

  @ApiProperty({
    description: 'Database ID to which recommendation belongs',
    type: String,
  })
  @Expose()
  databaseId: string;

  @ApiPropertyOptional({
    description: 'Determines if recommendation was shown to user',
    type: Boolean,
    example: false,
  })
  read?: boolean;

  @ApiPropertyOptional({
    description: 'Should this recommendation shown to user',
    type: Boolean,
    example: false,
  })
  @Expose()
  disabled?: boolean;
}
