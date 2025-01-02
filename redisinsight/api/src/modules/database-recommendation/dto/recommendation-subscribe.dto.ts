import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DatabaseRecommendationsSubscribeDto {
  @ApiProperty({
    type: String,
    description: 'Database instance ID',
  })
  @Expose()
  instanceId: string;
}
