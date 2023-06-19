import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty, IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CloudSubscriptionType } from 'src/modules/cloud/autodiscovery/models/cloud-subscription';

export class CloudDatabaseDetails {
  @ApiProperty({
    description: 'Database id from the cloud',
    type: Number,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt({ always: true })
  cloudId: number;

  @ApiProperty({
    description: 'Subscription type',
    enum: () => CloudSubscriptionType,
    example: CloudSubscriptionType.Flexible,
  })
  @Expose()
  @IsNotEmpty()
  @IsEnum(CloudSubscriptionType)
  subscriptionType: CloudSubscriptionType;

  @ApiPropertyOptional({
    description: 'Plan memory limit',
    type: Number,
    example: 256,
  })
  @Expose()
  @IsOptional()
  @IsNumber()
  planMemoryLimit?: number;

  @ApiPropertyOptional({
    description: 'Memory limit units',
    type: String,
    example: 'MB',
  })
  @Expose()
  @IsOptional()
  @IsString()
  memoryLimitMeasurementUnit?: string;
}
