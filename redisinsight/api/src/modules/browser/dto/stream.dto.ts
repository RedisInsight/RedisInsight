import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum, IsInt, IsString, Min,
} from 'class-validator';
import { KeyDto } from 'src/modules/browser/dto/keys.dto';
import { SortOrder } from 'src/constants';

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

export class StreamEntryDto {
  @ApiProperty({
    type: String,
    description: 'Entry ID',
  })
  @IsString()
  id: string;

  @ApiProperty({
    type: String,
    description: 'Entry fields',
  })
  fields: Record<string, string>;
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
