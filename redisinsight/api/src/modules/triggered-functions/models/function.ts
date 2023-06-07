import { Expose } from 'class-transformer';
import {
  IsArray, IsEnum, IsOptional, IsString, IsBoolean, IsNumber,
} from 'class-validator';
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
    description: 'Is functions is async',
    type: Number,
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  @Expose()
  is_async?: number;
}
