import {
  ApiProperty, ApiPropertyOptional, IntersectionType
} from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsEnum, IsInt, IsNotEmpty, IsString, Min, ValidateNested, isString,
} from 'class-validator';
import { KeyDto, KeyWithExpireDto } from 'src/modules/browser/dto/keys.dto';
import { SortOrder } from 'src/constants';
import { Type } from 'class-transformer';
import { IsObjectWithValues } from 'src/validators/isObjectWithValues.validator';

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
    example: { field1: 'value1', field2: 'value2' },
  })
  @IsDefined()
  @IsNotEmpty()
  @IsObjectWithValues([isString], { message: '$property must be an object with string values' })
  fields: Record<string, string>;
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

export class GetStreamEntriesResponse {
  @ApiProperty({
    type: String,
    description: 'Key Name',
  })
  keyName: string;

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
  firstEntry: StreamEntryDto;

  @ApiProperty({
    description: 'Last stream entry',
    type: StreamEntryDto,
  })
  lastEntry: StreamEntryDto;

  @ApiProperty({
    description: 'Stream entries',
    type: StreamEntryDto,
    isArray: true,
  })
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
        fields: {
          field1: 'value1',
          field2: 'value2',
        },
      },
      {
        id: '*',
        fields: {
          field1: 'value1',
          field2: 'value2',
        },
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

export class AddStreamEntriesResponse {
  @ApiProperty({
    type: String,
    description: 'Key Name',
  })
  keyName: string;

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
    description: 'Consumer group name',
    example: 'group',
  })
  name: string;

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
  @IsString()
  name: string;

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
  @Type(() => CreateConsumerGroupDto)
  consumerGroups: CreateConsumerGroupDto[];
}
