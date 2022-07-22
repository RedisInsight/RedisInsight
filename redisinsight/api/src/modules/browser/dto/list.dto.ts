import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { KeyDto, KeyResponse, KeyWithExpireDto } from './keys.dto';

export enum ListElementDestination {
  Tail = 'TAIL',
  Head = 'HEAD',
}

export class PushElementToListDto extends KeyDto {
  @ApiProperty({
    description: 'List element',
    type: String,
  })
  @IsDefined()
  @IsString()
  element: string;

  @ApiPropertyOptional({
    description:
      'In order to append elements to the end of the list, '
      + 'use the TAIL value, to prepend use HEAD value. '
      + 'Default: TAIL (when not specified)',
    default: ListElementDestination.Tail,
    enum: ListElementDestination,
  })
  @IsEnum(ListElementDestination, {
    message: `destination must be a valid enum value. Valid values: ${Object.values(
      ListElementDestination,
    )}.`,
  })
  destination: ListElementDestination = ListElementDestination.Tail;
}

export class PushListElementsResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of elements in the list after current operation.',
  })
  total: number;
}

export class SetListElementDto extends KeyDto {
  @ApiProperty({
    description: 'List element',
    type: String,
  })
  @IsDefined()
  @IsString()
  element: string;

  @ApiProperty({
    description: 'Element index',
    type: Number,
    minimum: 0,
  })
  @IsDefined()
  @Min(0)
  @IsInt({ always: true })
  @IsNotEmpty()
  index: number;
}

export class SetListElementResponse {
  @ApiProperty({
    description: 'Element index',
    type: Number,
    minimum: 0,
  })
  index: number;

  @ApiProperty({
    description: 'List element',
    type: String,
  })
  element: string;
}

export class CreateListWithExpireDto extends IntersectionType(
  PushElementToListDto,
  KeyWithExpireDto,
) {}

export class GetListElementsDto extends KeyDto {
  @ApiProperty({
    description: 'Specifying the number of elements to skip.',
    type: Number,
    minimum: 0,
    default: '0',
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsNotEmpty()
  offset: number;

  @ApiProperty({
    description:
      'Specifying the number of elements to return from starting at offset.',
    type: Number,
    minimum: 1,
    default: 15,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  count: number;
}

export class DeleteListElementsDto extends KeyDto {
  @ApiProperty({
    description:
      'In order to remove last elements of the list, use the TAIL value, else HEAD value',
    default: ListElementDestination.Tail,
    enum: ListElementDestination,
  })
  @IsDefined()
  @IsEnum(ListElementDestination, {
    message: `destination must be a valid enum value. Valid values: ${Object.values(
      ListElementDestination,
    )}.`,
  })
  destination: ListElementDestination;

  @ApiProperty({
    description: 'Specifying the number of elements to remove from list.',
    type: Number,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  count: number;
}

export class GetListElementsResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of elements in the currently-selected list.',
  })
  total: number;

  @ApiProperty({
    type: () => String,
    description: 'Array of elements.',
    isArray: true,
  })
  elements: string[];
}

export class GetListElementResponse extends KeyResponse {
  @ApiProperty({
    type: () => String,
    description: 'Element value',
  })
  value: string;
}

export class DeleteListElementsResponse {
  @ApiProperty({
    type: String,
    isArray: true,
    description: 'Removed elements from list',
  })
  elements: string[];
}
