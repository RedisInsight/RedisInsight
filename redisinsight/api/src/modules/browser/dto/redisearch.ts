import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize, IsDefined, IsEnum, IsNotEmpty, IsString, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum RedisearchIndexKeyType {
  HASH = 'HASH',
  JSON = 'JSON',
}

export enum RedisearchIndexDataType {
  TEXT = 'TEXT',
  TAG = 'TAG',
  NUMERIC = 'NUMERIC',
  GEO = 'GEO',
  VECTOR = 'VECTOR',
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
