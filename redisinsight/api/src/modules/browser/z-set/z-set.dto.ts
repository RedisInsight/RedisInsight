import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/constants';
import {
  DeleteMembersFromSetDto,
  DeleteMembersFromSetResponse,
} from 'src/modules/browser/set/set.dto';
import { RedisString } from 'src/common/constants';
import { IsRedisString, RedisStringType, isZSetScore } from 'src/common/decorators';
import {
  KeyDto,
  KeyResponse,
  KeyWithExpireDto,
  ScanDataTypeDto,
} from 'src/modules/browser/keys/keys.dto';

export class GetZSetMembersDto extends KeyDto {
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

  @ApiProperty({
    description:
      'Get elements sorted by score.'
      + ' In order to sort the members from the highest to the lowest score, use the DESC value, else ASC value',
    default: SortOrder.Desc,
    enum: SortOrder,
  })
  @IsNotEmpty()
  @IsEnum(SortOrder, {
    message: `sortOrder must be a valid enum value. Valid values: ${Object.values(
      SortOrder,
    )}.`,
  })
  sortOrder: SortOrder;
}

export class ZSetMemberDto {
  @ApiProperty({
    type: String,
    description: 'Member name value.',
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    description: 'Member score value.',
    type: Number || String,
    default: 1,
  })
  @IsDefined()
  @isZSetScore()
  score: number | 'inf' | '-inf';
}

export class AddMembersToZSetDto extends KeyDto {
  @ApiProperty({
    description: 'ZSet members',
    isArray: true,
    type: ZSetMemberDto,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => ZSetMemberDto)
  members: ZSetMemberDto[];
}

export class CreateZSetWithExpireDto extends IntersectionType(
  AddMembersToZSetDto,
  KeyWithExpireDto,
) {}

export class UpdateMemberInZSetDto extends KeyDto {
  @ApiProperty({
    description: 'ZSet member',
    type: ZSetMemberDto,
  })
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ZSetMemberDto)
  member: ZSetMemberDto;
}

export class DeleteMembersFromZSetDto extends DeleteMembersFromSetDto {}

export class SearchZSetMembersDto extends PickType(ScanDataTypeDto, [
  'keyName',
  'count',
  'cursor',
] as const) {
  @ApiProperty({
    description: 'Iterate only elements matching a given pattern.',
    type: String,
    default: '*',
  })
  @IsDefined()
  @IsString()
  match: string;
}

export class DeleteMembersFromZSetResponse extends DeleteMembersFromSetResponse {}

export class GetZSetResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of members in the currently-selected z-set.',
  })
  total: number;

  @ApiProperty({
    description: 'Array of Members.',
    isArray: true,
    type: () => ZSetMemberDto,
  })
  members: ZSetMemberDto[];
}

export class ScanZSetResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    minimum: 0,
    description:
      'The new cursor to use in the next call.'
      + ' If the property has value of 0, then the iteration is completed.',
  })
  nextCursor: number;

  @ApiProperty({
    description: 'Array of Members.',
    isArray: true,
    type: () => ZSetMemberDto,
  })
  members: ZSetMemberDto[];
}

export class SearchZSetMembersResponse extends ScanZSetResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of members in the currently-selected z-set.',
  })
  total: number;
}
