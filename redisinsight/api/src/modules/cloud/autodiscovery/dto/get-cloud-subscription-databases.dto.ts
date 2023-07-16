import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined, IsEnum, IsInt, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CloudSubscriptionType } from 'src/modules/cloud/autodiscovery/models';

export class GetCloudSubscriptionDatabasesDto {
  @ApiProperty({
    description: 'Subscription Id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  subscriptionId: number;

  @ApiProperty({
    description: 'Subscription Id',
    enum: CloudSubscriptionType,
  })
  @IsEnum(CloudSubscriptionType, {
    message: `subscriptionType must be a valid enum value. Valid values: ${Object.values(
      CloudSubscriptionType,
    )}.`,
  })
  @IsNotEmpty()
  subscriptionType: CloudSubscriptionType;
}
