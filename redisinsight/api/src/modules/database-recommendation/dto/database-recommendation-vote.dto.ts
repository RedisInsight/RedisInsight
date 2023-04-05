import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Vote } from 'src/modules/database-recommendation/models';

export class DatabaseRecommendationVoteDto {
  @ApiProperty({
    description: 'Recommendation vote',
    default: null,
    enum: Vote,
  })
  @IsEnum(Vote)
  vote: Vote;
}
