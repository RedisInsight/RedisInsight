import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSubscriptionAndDatabaseCloudJobDataDto {
  @ApiProperty({
    description: 'Plan id for create a subscription.',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  planId: number;
}
