import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  ArrayNotEmpty, IsArray, IsDefined, IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { KeyDto, KeyWithExpireDto, ScanDataTypeDto } from './keys.dto';

export class AddMembersToSetDto extends KeyDto {
  @ApiProperty({
    description: 'Set members',
    isArray: true,
    type: String,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  members: string[];
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
  @Type(() => String)
  members: string[];
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

export class SetScanResponse {
  @ApiProperty({
    type: String,
    description: 'Key Name',
  })
  keyName: string;

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
  members: string[];
}

export class GetSetMembersResponse extends SetScanResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of members in the currently-selected set.',
  })
  total: number;
}
