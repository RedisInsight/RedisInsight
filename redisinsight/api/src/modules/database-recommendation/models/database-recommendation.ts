import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum Vote {
  DoubleLike = 'very useful',
  Like = 'useful',
  Dislike = 'not useful',
}

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

  @ApiPropertyOptional({
    description: 'Recommendation vote',
    default: Vote.Like,
    enum: Vote,
  })
  @IsEnum(Vote)
  @IsOptional()
  vote?: Vote = null;

  @ApiPropertyOptional({
    description: 'Should this recommendation hidden',
    type: Boolean,
    example: false,
  })
  @Expose()
  hide?: boolean;
}
