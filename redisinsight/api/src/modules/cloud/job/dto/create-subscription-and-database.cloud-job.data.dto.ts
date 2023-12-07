import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSubscriptionAndDatabaseCloudJobDataDto {
  @ApiPropertyOptional({
    description: 'Plan id for create a subscription.',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  planId: number;

  @ApiPropertyOptional({
    description: 'Auto select plan id',
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  isAutoCreate: boolean;
}
