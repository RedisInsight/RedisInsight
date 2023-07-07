import { Expose, Type } from 'class-transformer';
import {
  IsArray, IsString, IsNumber,
} from 'class-validator';
import { Function } from 'src/modules/triggered-functions/models';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class ShortFunction extends PickType(Function, ['name', 'type'] as const) {}

export class Library {
  @ApiProperty({
    description: 'Library name',
    type: String,
    example: 'name',
  })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Library apy version',
    type: String,
    example: '1.0',
  })
  @IsString()
  @Expose()
  apiVersion: string;

  @ApiProperty({
    description: 'User name',
    type: String,
    example: 'default',
  })
  @IsString()
  @Expose()
  user: string;

  @ApiProperty({
    description: 'Total of pending jobs',
    type: Number,
    example: 0,
  })
  @IsNumber()
  @Expose()
  pendingJobs: number;

  @ApiProperty({
    description: 'Library configuration',
    type: String,
  })
  @IsString()
  @Expose()
  configuration: string;

  @ApiProperty({
    description: 'Library code',
    type: String,
    example: 0,
  })
  @IsString()
  @Expose()
  code: string;

  @ApiProperty({
    description: 'Array of functions with name, type fields',
    isArray: true,
    type: ShortFunction,
  })
  @IsArray()
  @Expose()
  @Type(() => ShortFunction)
  functions: ShortFunction[];

  @ApiProperty({
    description: 'Total number of functions',
    type: Number,
    example: 0,
  })
  @IsNumber()
  @Expose()
  totalFunctions: number;
}
