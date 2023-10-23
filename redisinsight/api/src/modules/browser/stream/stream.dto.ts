import {
  ApiProperty, ApiPropertyOptional, IntersectionType,
} from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
  NotEquals,
  ValidateIf,
  IsBoolean,
} from 'class-validator';
import { KeyDto, KeyResponse, KeyWithExpireDto } from 'src/modules/browser/keys/keys.dto';
import { SortOrder } from 'src/constants';
import { Type } from 'class-transformer';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class StreamEntryFieldDto {
  @ApiProperty({
    type: String,
    description: 'Entry field name',
    example: 'field1',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    type: String,
    description: 'Entry value',
    example: 'value1',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}

export class StreamEntryDto {
  @ApiProperty({
    type: String,
    description: 'Entry ID',
    example: '*',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    type: Object,
    description: 'Entry fields',
    example: [{ name: 'field1', value: 'value1' }, { name: 'field2', value: 'value2' }],
  })
  @IsDefined()
  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsArray()
  @Type(() => StreamEntryFieldDto)
  @ValidateNested({ each: true })
  fields: StreamEntryFieldDto[];
}

export class GetStreamEntriesDto extends KeyDto {
  @ApiPropertyOptional({
    description: 'Specifying the start id',
    type: String,
    default: '-',
  })
  @IsString()
  start?: string = '-';

  @ApiPropertyOptional({
    description: 'Specifying the end id',
    type: String,
    default: '+',
  })
  @IsString()
  end?: string = '+';

  @ApiPropertyOptional({
    description:
      'Specifying the number of entries to return.',
    type: Number,
    minimum: 1,
    default: 500,
  })
  @IsInt()
  @Min(1)
  count?: number = 500;

  @ApiProperty({
    description: 'Get entries sort by IDs order.',
    default: SortOrder.Desc,
    enum: SortOrder,
  })
  @IsEnum(SortOrder, {
    message: `sortOrder must be a valid enum value. Valid values: ${Object.values(
      SortOrder,
    )}.`,
  })
  sortOrder?: SortOrder = SortOrder.Desc;
}

export class GetStreamEntriesResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'Total number of entries',
  })
  total: number;

  @ApiProperty({
    type: String,
    description: 'Last generated id in the stream',
  })
  lastGeneratedId: string;

  @ApiProperty({
    description: 'First stream entry',
    type: StreamEntryDto,
  })
  @Type(() => StreamEntryDto)
  firstEntry: StreamEntryDto;

  @ApiProperty({
    description: 'Last stream entry',
    type: StreamEntryDto,
  })
  @Type(() => StreamEntryDto)
  lastEntry: StreamEntryDto;

  @ApiProperty({
    description: 'Stream entries',
    type: StreamEntryDto,
    isArray: true,
  })
  @Type(() => StreamEntryDto)
  entries: StreamEntryDto[];
}

export class AddStreamEntriesDto extends KeyDto {
  @ApiProperty({
    description: 'Entries to push',
    type: StreamEntryDto,
    isArray: true,
    example: [
      {
        id: '*',
        fields: [{ name: 'field1', value: 'value1' }, { name: 'field2', value: 'value2' }],
      },
      {
        id: '*',
        fields: [{ name: 'field1', value: 'value1' }, { name: 'field2', value: 'value2' }],
      },
    ],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StreamEntryDto)
  entries: StreamEntryDto[];
}

export class AddStreamEntriesResponse extends KeyResponse {
  @ApiProperty({
    description: 'Entries IDs',
    type: String,
    isArray: true,
  })
  entries: string[];
}

export class DeleteStreamEntriesDto extends KeyDto {
  @ApiProperty({
    description: 'Entries IDs',
    type: String,
    isArray: true,
    example: ['1650985323741-0', '1650985323770-0'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  entries: string[];
}

export class DeleteStreamEntriesResponse {
  @ApiProperty({
    description: 'Number of deleted entries',
    type: Number,
  })
  affected: number;
}

export class CreateStreamDto extends IntersectionType(
  AddStreamEntriesDto,
  KeyWithExpireDto,
) {}

export class ConsumerGroupDto {
  @ApiProperty({
    type: String,
    description: 'Consumer Group name',
    example: 'group',
  })
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    type: Number,
    description: 'Number of consumers',
    example: 2,
  })
  consumers: number = 0;

  @ApiProperty({
    type: Number,
    description: 'Number of pending messages',
    example: 2,
  })
  pending: number = 0;

  @ApiProperty({
    type: String,
    description: 'Smallest Id of the message that is pending in the group',
    example: '1657892649-0',
  })
  smallestPendingId: string;

  @ApiProperty({
    type: String,
    description: 'Greatest Id of the message that is pending in the group',
    example: '1657892680-0',
  })
  greatestPendingId: string;

  @ApiProperty({
    type: String,
    description: 'Id of last delivered message',
    example: '1657892648-0',
  })
  lastDeliveredId: string;
}

export class CreateConsumerGroupDto {
  @ApiProperty({
    type: String,
    description: 'Consumer group name',
    example: 'group',
  })
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    type: String,
    description: 'Id of last delivered message',
    example: '1657892648-0',
  })
  @IsNotEmpty()
  @IsString()
  lastDeliveredId: string;
}

export class CreateConsumerGroupsDto extends KeyDto {
  @ApiProperty({
    type: () => CreateConsumerGroupDto,
    isArray: true,
    description: 'List of consumer groups to create',
  })
  @ValidateNested()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreateConsumerGroupDto)
  consumerGroups: CreateConsumerGroupDto[];
}

export class UpdateConsumerGroupDto extends IntersectionType(
  KeyDto,
  CreateConsumerGroupDto,
) {}

export class DeleteConsumerGroupsDto extends KeyDto {
  @ApiProperty({
    description: 'Consumer group names',
    type: String,
    isArray: true,
    example: ['Group-1', 'Group-1'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  consumerGroups: RedisString[];
}

export class DeleteConsumerGroupsResponse {
  @ApiProperty({
    description: 'Number of deleted consumer groups',
    type: Number,
  })
  affected: number;
}

export class ConsumerDto {
  @ApiProperty({
    type: String,
    description: 'The consumer\'s name',
    example: 'consumer-2',
  })
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    type: Number,
    description: 'The number of pending messages for the client, '
      + 'which are messages that were delivered but are yet to be acknowledged',
    example: 2,
  })
  pending: number = 0;

  @ApiProperty({
    type: Number,
    description: 'The number of milliseconds that have passed since the consumer last interacted with the server',
    example: 22442,
  })
  idle: number = 0;
}

export class GetConsumersDto extends KeyDto {
  @ApiProperty({
    type: String,
    description: 'Consumer group name',
    example: 'group-1',
  })
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  groupName: RedisString;
}

export class DeleteConsumersDto extends GetConsumersDto {
  @ApiProperty({
    description: 'Names of consumers to delete',
    type: String,
    isArray: true,
    example: ['consumer-1', 'consumer-2'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  consumerNames: RedisString[];
}

export class PendingEntryDto {
  @ApiProperty({
    type: String,
    description: 'Entry ID',
    example: '*',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Consumer name',
    example: 'consumer-1',
  })
  @RedisStringType()
  consumerName: RedisString;

  @ApiProperty({
    type: Number,
    description: 'The number of milliseconds that elapsed since the last time '
      + 'this message was delivered to this consumer',
    example: 22442,
  })
  idle: number = 0;

  @ApiProperty({
    type: Number,
    description: 'The number of times this message was delivered',
    example: 2,
  })
  delivered: number = 0;
}

export class GetPendingEntriesDto extends IntersectionType(
  KeyDto,
  GetConsumersDto,
) {
  @ApiProperty({
    type: String,
    description: 'Consumer name',
    example: 'consumer-1',
  })
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  consumerName: RedisString;

  @ApiPropertyOptional({
    description: 'Specifying the start id',
    type: String,
    default: '-',
  })
  @IsString()
  start?: string = '-';

  @ApiPropertyOptional({
    description: 'Specifying the end id',
    type: String,
    default: '+',
  })
  @IsString()
  end?: string = '+';

  @ApiPropertyOptional({
    description:
      'Specifying the number of pending messages to return.',
    type: Number,
    minimum: 1,
    default: 500,
  })
  @IsInt()
  @Min(1)
  count?: number = 500;
}

export class AckPendingEntriesDto extends GetConsumersDto {
  @ApiProperty({
    description: 'Entries IDs',
    type: String,
    isArray: true,
    example: ['1650985323741-0', '1650985323770-0'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @IsNotEmpty({ each: true })
  @RedisStringType({ each: true })
  entries: RedisString[];
}

export class AckPendingEntriesResponse {
  @ApiProperty({
    description: 'Number of affected entries',
    type: Number,
  })
  affected: number;
}

export class ClaimPendingEntryDto extends KeyDto {
  @ApiProperty({
    type: String,
    description: 'Consumer group name',
    example: 'group-1',
  })
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  groupName: RedisString;

  @ApiProperty({
    type: String,
    description: 'Consumer name',
    example: 'consumer-1',
  })
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  consumerName: RedisString;

  @ApiProperty({
    description: 'Claim only if its idle time is greater the minimum idle time ',
    type: Number,
    minimum: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  minIdleTime: number = 0;

  @ApiProperty({
    description: 'Entries IDs',
    type: String,
    isArray: true,
    example: ['1650985323741-0', '1650985323770-0'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  entries: string[];

  @ApiPropertyOptional({
    description: 'Set the idle time (last time it was delivered) of the message',
    type: Number,
    minimum: 0,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  idle?: number;

  @ApiPropertyOptional({
    description: 'This is the same as IDLE but instead of a relative amount of milliseconds, '
      + 'it sets the idle time to a specific Unix time (in milliseconds)',
    type: Number,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  time?: number;

  @ApiPropertyOptional({
    description: 'Set the retry counter to the specified value. '
      + 'This counter is incremented every time a message is delivered again. '
      + 'Normally XCLAIM does not alter this counter, which is just served to clients when the XPENDING command '
      + 'is called: this way clients can detect anomalies, like messages that are never processed '
      + 'for some reason after a big number of delivery attempts',
    type: Number,
    minimum: 0,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  retryCount?: number;

  @ApiPropertyOptional({
    description: 'Creates the pending message entry in the PEL even if certain specified IDs are not already '
      + 'in the PEL assigned to a different client',
    type: Boolean,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsBoolean()
  force?: boolean;
}

export class ClaimPendingEntriesResponse {
  @ApiProperty({
    description: 'Entries IDs were affected by claim command',
    type: String,
    isArray: true,
    example: ['1650985323741-0', '1650985323770-0'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  affected: string[];
}
