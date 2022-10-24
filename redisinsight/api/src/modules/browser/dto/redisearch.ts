import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize, IsDefined, IsEnum, IsInt, IsNotEmpty, IsString, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

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

export class CreateRedisearchIndexFieldDto {
  @ApiProperty({
    description: 'Name of field to be indexed',
    type: String,
  })
  @IsDefined()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of how data must be indexed',
    enum: RedisearchIndexDataType,
  })
  @IsDefined()
  @IsEnum(RedisearchIndexDataType)
  type: RedisearchIndexDataType;
}

export class CreateRedisearchIndexDto {
  @ApiProperty({
    description: 'Index Name',
    type: String,
  })
  @IsDefined()
  @IsString()
  index: string;

  @ApiProperty({
    description: 'Type of keys to index',
    enum: RedisearchIndexKeyType,
  })
  @IsDefined()
  @IsEnum(RedisearchIndexKeyType)
  type: RedisearchIndexKeyType;

  @ApiProperty({
    description: 'Keys prefixes to find keys for index',
    isArray: true,
    type: String,
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  prefixes: string[];

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
  @IsString()
  index: string;

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
  @Type(() => Number)
  limit: number = 500; // todo use @Default from another PR

  @ApiProperty({
    description: 'Offset position to start searching',
    type: Number,
  })
  @IsDefined()
  @IsInt()
  @Type(() => Number)
  offset: number = 0; // todo use @Default from another PR
}
