import { Expose, Transform } from 'class-transformer';
import {
  IsArray, IsEnum, IsOptional, IsString, IsBoolean, IsNumber,
} from 'class-validator';
import { isNumber } from 'lodash';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FunctionType {
  Function = 'functions',
  ClusterFunction = 'cluster_functions',
  KeyspaceTrigger = 'keyspace_triggers',
  StreamTrigger = 'stream_triggers',
}

export class Function {
  @ApiProperty({
    description: 'Function type',
    enum: FunctionType,
  })
  @IsEnum(FunctionType)
  @Expose()
  type: FunctionType;

  @ApiProperty({
    description: 'Function name',
    type: String,
    example: 'name',
  })
  @IsString()
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Library name',
    type: String,
    example: 'lib',
  })
  @IsString()
  @Expose()
  library?: string;

  @ApiPropertyOptional({
    description: 'Total succeed function',
    type: Number,
    example: 1,
  })
  @IsNumber()
  @Expose()
  success?: number;

  @ApiPropertyOptional({
    description: 'Total failed function',
    type: Number,
    example: 1,
  })
  @IsNumber()
  @Expose()
  fail?: number;

  @ApiPropertyOptional({
    description: 'Total trigger function',
    type: Number,
    example: 1,
  })
  @IsNumber()
  @Expose()
  total?: number;

  @ApiPropertyOptional({
    description: 'Function flags',
    type: String,
    isArray: true,
  })
  @IsArray()
  @Expose()
  flags?: string[];

  @ApiPropertyOptional({
    description: 'Is function is async',
    type: Boolean,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Expose()
  @Transform((val) => (isNumber(val) ? val === 1 : undefined))
  isAsync?: boolean;

  @ApiPropertyOptional({
    description: 'Function description',
    type: String,
    example: 'some description',
  })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description: 'Last execution error',
    type: String,
    example: 'error',
  })
  @IsString()
  @IsOptional()
  @Expose()
  lastError?: string;

  @ApiPropertyOptional({
    description: 'Last function execution time',
    type: Number,
    example: 1,
  })
  @IsNumber()
  @Expose()
  lastExecutionTime?: number;

  @ApiPropertyOptional({
    description: 'Total execution time',
    type: Number,
    example: 1,
  })
  @IsNumber()
  @Expose()
  totalExecutionTime?: number;

  @ApiPropertyOptional({
    description: 'Stream prefix',
    type: String,
    example: 'stream',
  })
  @IsString()
  @IsOptional()
  @Expose()
  prefix?: string;

  @ApiPropertyOptional({
    description: 'Whether or not to trim the stream',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform((val) => (isNumber(val) ? val === 1 : undefined))
  @Expose()
  trim?: boolean;

  @ApiPropertyOptional({
    description: 'How many elements can be processed simultaneously',
    type: Number,
    example: 1,
  })
  @IsNumber()
  @Expose()
  window?: number;
}
