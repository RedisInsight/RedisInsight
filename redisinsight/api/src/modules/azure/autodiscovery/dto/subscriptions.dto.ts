import { IsArray, ValidateNested, IsString, IsBoolean } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class SubscriptionDto {
  @IsString()
  @ApiProperty({ description: 'Azure subscription name' })
  name: string

  @IsString()
  @ApiProperty({ description: 'Azure subscription id' })
  id: string

  @IsBoolean()
  @ApiProperty({ description: 'Whether the subscription is active' })
  isActive: boolean
}

export class SubscriptionsDto {
  @ApiProperty({
    type: [SubscriptionDto],
    description: 'List of Azure subscriptions',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionDto)
  subscriptions: SubscriptionDto[]
}