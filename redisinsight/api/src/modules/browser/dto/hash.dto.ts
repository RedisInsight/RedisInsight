import {
  KeyDto,
  KeyWithExpireDto,
  ScanDataTypeDto,
} from 'src/modules/browser/dto/keys.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HashFieldDto {
  @ApiProperty({
    description: 'Field',
    type: String,
  })
  @IsDefined()
  @IsString()
  field: string;

  @ApiProperty({
    description: 'Field',
    type: String,
  })
  @IsDefined()
  @IsString()
  value: string;
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

export class HashScanResponse {
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
  @Type(() => String)
  fields: string[];
}

export class DeleteFieldsFromHashResponse {
  @ApiProperty({
    description: 'Number of affected fields',
    type: Number,
  })
  affected: number;
}
