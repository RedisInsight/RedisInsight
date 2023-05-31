import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Vote } from 'src/modules/database-recommendation/models';

export class ModifyDatabaseRecommendationDto {
  @ApiPropertyOptional({
    description: 'Recommendation vote',
    default: null,
    enum: Vote,
  })
  @IsOptional()
  @IsEnum(Vote)
  vote?: Vote;

  @ApiPropertyOptional({
    description: 'Hide recommendation',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  hide?: boolean;
}
