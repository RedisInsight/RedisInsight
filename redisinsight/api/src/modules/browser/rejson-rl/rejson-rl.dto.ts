import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { KeyDto, KeyWithExpireDto } from 'src/modules/browser/keys/keys.dto';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  Validate,
} from 'class-validator';
import { SerializedJsonValidator } from 'src/validators';

export class GetRejsonRlDto extends KeyDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Path to look for data',
  })
  @IsString()
  @IsNotEmpty()
  path?: string = '.';

  @ApiPropertyOptional({
    type: Boolean,
    description:
      "Don't check for json size and return whole json in path when enabled",
  })
  @IsBoolean()
  forceRetrieve?: boolean;
}

enum RejsonRlDataType {
  String = 'string',
  Number = 'number',
  Integer = 'integer',
  Boolean = 'boolean',
  Null = 'null',
  Array = 'array',
  Object = 'object',
}

export class SafeRejsonRlDataDtO {
  @ApiProperty({
    type: String,
    description: 'Key inside json data',
  })
  key: string;

  @ApiProperty({
    type: String,
    description: 'Path of the json field',
  })
  path: string;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Number of properties/elements inside field (for object and arrays only)',
  })
  cardinality?: number;

  @ApiProperty({
    enum: RejsonRlDataType,
    description: 'Type of the field',
  })
  type: RejsonRlDataType;

  @ApiPropertyOptional({
    type: String,
    description: 'Any value',
  })
  value?: string | number | boolean | null;
}

export class GetRejsonRlResponseDto {
  @ApiProperty({
    type: Boolean,
    description: 'Determines if json value was downloaded',
  })
  downloaded: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'Type of data in the requested path',
  })
  type?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Requested path',
  })
  path?: string;

  @ApiProperty({
    type: () => SafeRejsonRlDataDtO,
    isArray: true,
  })
  data: SafeRejsonRlDataDtO[] | string | number | boolean | null;
}

// ======================= Create DTOs
export class CreateRejsonRlDto extends KeyDto {
  @ApiProperty({
    description: 'Valid json string',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Validate(SerializedJsonValidator)
  data: string;
}

export class CreateRejsonRlWithExpireDto extends IntersectionType(
  CreateRejsonRlDto,
  KeyWithExpireDto,
) {}

// ======================= Modify [JSON.SET] DTOs
export class ModifyRejsonRlSetDto extends KeyDto {
  @ApiProperty({
    type: String,
    description: 'Path of the json field',
  })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({
    description: 'Array of valid serialized jsons',
    type: String,
  })
  @Validate(SerializedJsonValidator)
  @IsNotEmpty()
  @IsString()
  data: string;
}

// ======================= Modify [JSON.ARRAPPEND] DTOs
export class ModifyRejsonRlArrAppendDto extends KeyDto {
  @ApiProperty({
    type: String,
    description: 'Path of the json field',
  })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({
    description: 'Array of valid serialized jsons',
    type: String,
    isArray: true,
  })
  @IsArray()
  @Validate(SerializedJsonValidator, {
    each: true,
  })
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  data: string[];
}

// ======================= Remove [JSON.DEL] DTOs
export class RemoveRejsonRlDto extends KeyDto {
  @ApiProperty({
    type: String,
    description: 'Path of the json field',
  })
  @IsString()
  @IsNotEmpty()
  path: string;
}

export class RemoveRejsonRlResponse {
  @ApiProperty({
    description: 'Integer , specifically the number of paths deleted (0 or 1).',
    type: Number,
  })
  affected: number;
}
