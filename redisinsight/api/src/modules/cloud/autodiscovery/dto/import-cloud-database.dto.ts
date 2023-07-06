import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined, IsEnum, IsInt, IsNotEmpty,
} from 'class-validator';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';

export class ImportCloudDatabaseDto {
  @ApiProperty({
    description: 'Subscription id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  subscriptionId: number;

  @IsEnum(CloudSubscriptionType)
  @IsNotEmpty()
  subscriptionType: CloudSubscriptionType;

  @ApiProperty({
    description: 'Database id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  databaseId: number;
}
