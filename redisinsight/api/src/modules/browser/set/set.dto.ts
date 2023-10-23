import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  ArrayNotEmpty, IsArray, IsDefined,
} from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import {
  KeyDto, KeyResponse, KeyWithExpireDto, ScanDataTypeDto,
} from 'src/modules/browser/keys/keys.dto';

export class AddMembersToSetDto extends KeyDto {
  @ApiProperty({
    description: 'Set members',
    isArray: true,
    type: String,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  members: RedisString[];
}

export class DeleteMembersFromSetDto extends KeyDto {
  @ApiProperty({
    description: 'Key members',
    type: String,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  members: RedisString[];
}

export class CreateSetWithExpireDto extends IntersectionType(
  AddMembersToSetDto,
  KeyWithExpireDto,
) {}

export class DeleteMembersFromSetResponse {
  @ApiProperty({
    description: 'Number of affected members',
    type: Number,
  })
  affected: number;
}

export class GetSetMembersDto extends ScanDataTypeDto {}

export class SetScanResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    minimum: 0,
    description:
      'The new cursor to use in the next call.'
      + ' If the property has value of 0, then the iteration is completed.',
  })
  nextCursor: number;

  @ApiProperty({
    type: () => String,
    description: 'Array of members.',
    isArray: true,
  })
  @RedisStringType({ each: true })
  members: RedisString[];
}

export class GetSetMembersResponse extends SetScanResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of members in the currently-selected set.',
  })
  total: number;
}
