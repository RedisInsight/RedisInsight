import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionDto {
  @ApiProperty({ description: 'Azure subscription ID' })
  @IsString()
  id: string;
}

export class SubscriptionsDto {
  @ApiProperty({
    type: [SubscriptionDto],
    description: 'List of Azure subscriptions',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionDto)
  subscriptions: SubscriptionDto[];
}