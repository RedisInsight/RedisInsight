import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';

export class RecommendationDto {
  @ApiProperty({
    description: 'Recommendation name',
    type: String,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Should recommendation be calculated',
    type: Boolean,
  })
  @IsBoolean()
  disabled?: boolean;
}
