import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined, IsInt, IsNotEmpty, IsString,
} from 'class-validator';
import { Exclude, Transform, Type } from 'class-transformer';
import { RedisCloudSubscriptionStatus } from '../models/redis-cloud-subscriptions';
import { RedisEnterpriseDatabaseStatus } from '../models/redis-enterprise-database';

export class CloudAuthDto {
  @ApiProperty({
    description: 'Cloud API account key',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString({ always: true })
  apiKey: string;

  @ApiProperty({
    description: 'Cloud API secret key',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString({ always: true })
  apiSecretKey: string;
}

export class GetDatabasesInCloudSubscriptionDto extends CloudAuthDto {
  @ApiProperty({
    description: 'Subscription Id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  subscriptionId: number;
}

export class GetDatabaseInCloudSubscriptionDto extends CloudAuthDto {
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
    description: 'Database Id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  databaseId: number;
}

export class GetDatabasesInMultipleCloudSubscriptionsDto extends CloudAuthDto {
  @ApiProperty({
    description: 'Subscription Ids',
    type: Number,
    isArray: true,
  })
  @IsDefined()
  @IsInt({ each: true })
  @Type(() => Number)
  @Transform((value: number | number[]) => {
    if (typeof value === 'number') {
      return [value];
    }
    return value;
  })
  subscriptionIds: number[];
}

export class GetCloudAccountShortInfoResponse {
  @ApiProperty({
    description: 'Account id',
    type: Number,
  })
  accountId: number;

  @ApiProperty({
    description: 'Account name',
    type: String,
  })
  accountName: string;

  @ApiProperty({
    description: 'Account owner name',
    type: String,
  })
  ownerName: string;

  @ApiProperty({
    description: 'Account owner email',
    type: String,
  })
  ownerEmail: string;
}

export class GetRedisCloudSubscriptionResponse {
  @ApiProperty({
    description: 'Subscription id',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Subscription name',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Number of databases in subscription',
    type: Number,
  })
  numberOfDatabases: number;

  @ApiProperty({
    description: 'Subscription status',
    enum: RedisCloudSubscriptionStatus,
    default: RedisCloudSubscriptionStatus.Active,
  })
  status: RedisCloudSubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Subscription provider',
    type: String,
  })
  provider?: string;

  @ApiPropertyOptional({
    description: 'Subscription region',
    type: String,
  })
  region?: string;
}

export class RedisCloudDatabase {
  @ApiProperty({
    description: 'Subscription id',
    type: Number,
  })
  subscriptionId: number;

  @ApiProperty({
    description: 'Database id',
    type: Number,
  })
  databaseId: number;

  @ApiProperty({
    description: 'Database name',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Address your Redis Cloud database is available on',
    type: String,
  })
  publicEndpoint: string;

  @ApiProperty({
    description: 'Database status',
    enum: RedisEnterpriseDatabaseStatus,
    default: RedisEnterpriseDatabaseStatus.Active,
  })
  status: RedisEnterpriseDatabaseStatus;

  @ApiProperty({
    description: 'Is ssl authentication enabled or not',
    type: Boolean,
  })
  sslClientAuthentication: boolean;

  @ApiProperty({
    description: 'Information about the modules loaded to the database',
    type: String,
    isArray: true,
  })
  modules: string[];

  @ApiProperty({
    description: 'Additional database options',
    type: Object,
  })
  options: any;

  @Exclude()
  password?: string;

  constructor(partial: Partial<RedisCloudDatabase>) {
    Object.assign(this, partial);
  }
}
