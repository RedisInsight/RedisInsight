import {
  KeyDto, KeyResponse,
  KeyWithExpireDto,
  ScanDataTypeDto,
} from 'src/modules/browser/keys/keys.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class HashFieldDto {
  @ApiProperty({
    description: 'Field',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  field: RedisString;

  @ApiProperty({
    description: 'Field',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}

export class AddFieldsToHashDto extends KeyDto {
  @ApiProperty({
    description: 'Hash fields',
    isArray: true,
    type: HashFieldDto,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => HashFieldDto)
  fields: HashFieldDto[];
}

export class CreateHashWithExpireDto extends IntersectionType(
  AddFieldsToHashDto,
  KeyWithExpireDto,
) {}

export class GetHashFieldsDto extends ScanDataTypeDto {}

export class HashScanResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    minimum: 0,
    description:
      'The new cursor to use in the next call.'
      + ' If the property has value of 0, then the iteration is completed.',
  })
  nextCursor: number;

  @ApiProperty({
    type: () => HashFieldDto,
    description: 'Array of members.',
    isArray: true,
  })
  fields: HashFieldDto[];
}

export class GetHashFieldsResponse extends HashScanResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of fields in the currently-selected hash.',
  })
  total: number;
}

export class DeleteFieldsFromHashDto extends KeyDto {
  @ApiProperty({
    description: 'Hash fields',
    type: String,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  fields: RedisString[];
}

export class DeleteFieldsFromHashResponse {
  @ApiProperty({
    description: 'Number of affected fields',
    type: Number,
  })
  affected: number;
}
