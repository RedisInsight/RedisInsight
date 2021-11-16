import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddRedisDatabaseStatus } from 'src/modules/instances/dto/redis-enterprise-cluster.dto';
import { GetSentinelMastersDto } from 'src/modules/redis-sentinel/dto/sentinel.dto';
import { DatabaseInstanceResponse } from 'src/modules/instances/dto/database-instance.dto';

export class AddSentinelMasterDto {
  @ApiProperty({
    description:
      'The name under which the base will be saved in the application.',
    type: String,
  })
  @IsDefined()
  @IsString({ always: true })
  @IsNotEmpty()
  @MaxLength(500)
  alias: string;

  @ApiProperty({
    description: 'Sentinel master group name.',
    type: String,
  })
  @IsDefined()
  @IsString({ always: true })
  name: string;

  @ApiPropertyOptional({
    description:
      'The username, if your database is ACL enabled, otherwise leave this field empty.',
    type: String,
  })
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description:
      'The password, if any, for your Redis database. '
      + 'If your database doesn’t require a password, leave this field empty.',
    type: String,
  })
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'Logical database number.',
    type: Number,
    example: 0,
  })
  @IsInt()
  @Max(15)
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  db?: number;
}

export class AddSentinelMastersDto extends GetSentinelMastersDto {
  @ApiProperty({
    description: 'The Sentinel master group list.',
    type: AddSentinelMasterDto,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => AddSentinelMasterDto)
  masters: AddSentinelMasterDto[];
}

export class AddSentinelMasterResponse {
  @ApiPropertyOptional({
    description: 'Database instance id.',
    type: String,
  })
  id?: string;

  @ApiProperty({
    description: 'Sentinel master group name.',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Add Sentinel Master status',
    default: AddRedisDatabaseStatus.Success,
    enum: AddRedisDatabaseStatus,
  })
  status: AddRedisDatabaseStatus;

  @ApiProperty({
    description: 'Message',
    type: String,
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Error',
  })
  error?: string | object;

  instance?: DatabaseInstanceResponse;
}
