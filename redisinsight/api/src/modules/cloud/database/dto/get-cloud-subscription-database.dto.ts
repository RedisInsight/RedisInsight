import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined, IsEnum, IsInt, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';

export class GetCloudSubscriptionDatabaseDto {
  @ApiProperty({
    description: 'Subscription Id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  subscriptionId: number;

  @IsEnum(CloudSubscriptionType)
  @IsNotEmpty()
  subscriptionType: CloudSubscriptionType;

  @ApiProperty({
    description: 'Database Id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  databaseId: number;
}
