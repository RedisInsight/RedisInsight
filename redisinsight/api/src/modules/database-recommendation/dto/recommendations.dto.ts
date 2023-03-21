import { ApiProperty } from '@nestjs/swagger';
import { RecommendationDto } from './recommendation.dto';

export class RecommendationsDto {
  @ApiProperty({
    type: () => RecommendationDto,
    isArray: true,
    description: 'Ordered recommendations list',
  })
  recommendations: RecommendationDto[];

  @ApiProperty({
    type: Number,
    example: 2,
    description: 'Number of unread recommendations',
  })
  totalUnread: number;

  constructor(entity: Partial<RecommendationsDto>) {
    Object.assign(this, entity);
  }
}
