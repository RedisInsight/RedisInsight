import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize, IsDefined, IsEnum, IsInt, IsOptional, IsString, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { RedisString } from 'src/common/constants';
import { IsRedisString, RedisStringType } from 'src/common/decorators';

export enum RedisearchIndexKeyType {
  HASH = 'hash',
  JSON = 'json',
}

export enum RedisearchIndexDataType {
  TEXT = 'text',
  TAG = 'tag',
  NUMERIC = 'numeric',
  GEO = 'geo',
  VECTOR = 'vector',
}

export class ListRedisearchIndexesResponse {
  @ApiProperty({
    description: 'Indexes names',
    type: String,
  })
  @RedisStringType({ each: true })
  indexes: RedisString[];
}

export class CreateRedisearchIndexFieldDto {
  @ApiProperty({
    description: 'Name of field to be indexed',
    type: String,
  })
  @IsDefined()
  @RedisStringType()
  @IsRedisString()
  name: RedisString;

  @ApiProperty({
    description: 'Type of how data must be indexed',
    enum: RedisearchIndexDataType,
  })
  @IsDefined()
  @IsEnum(RedisearchIndexDataType, {
    message: `type must be a valid enum value. Valid values: ${Object.values(
      RedisearchIndexDataType,
    )}.`,
  })
  type: RedisearchIndexDataType;
}

export class CreateRedisearchIndexDto {
  @ApiProperty({
    description: 'Index Name',
    type: String,
  })
  @IsDefined()
  @RedisStringType()
  @IsRedisString()
  index: RedisString;

  @ApiProperty({
    description: 'Type of keys to index',
    enum: RedisearchIndexKeyType,
  })
  @IsDefined()
  @IsEnum(RedisearchIndexKeyType, {
    message: `type must be a valid enum value. Valid values: ${Object.values(
      RedisearchIndexKeyType,
    )}.`,
  })
  type: RedisearchIndexKeyType;

  @ApiPropertyOptional({
    description: 'Keys prefixes to find keys for index',
    isArray: true,
    type: String,
  })
  @IsOptional()
  @RedisStringType({ each: true })
  @IsRedisString({ each: true })
  prefixes?: RedisString[];

  @ApiProperty({
    description: 'Fields to index',
    isArray: true,
    type: CreateRedisearchIndexFieldDto,
  })
  @Type(() => CreateRedisearchIndexFieldDto)
  @ValidateNested()
  @ArrayMinSize(1)
  fields: CreateRedisearchIndexFieldDto[];
}

export class SearchRedisearchDto {
  @ApiProperty({
    description: 'Index Name',
    type: String,
  })
  @IsDefined()
  @RedisStringType()
  @IsRedisString()
  index: RedisString;

  @ApiProperty({
    description: 'Query to search inside data fields',
    type: String,
  })
  @IsDefined()
  @IsString()
  query: string;

  @ApiProperty({
    description: 'Limit number of results to be returned',
    type: Number,
  })
  @IsDefined()
  @IsInt()
  limit: number = 500; // todo use @Default from another PR

  @ApiProperty({
    description: 'Offset position to start searching',
    type: Number,
  })
  @IsDefined()
  @IsInt()
  offset: number = 0; // todo use @Default from another PR
}
