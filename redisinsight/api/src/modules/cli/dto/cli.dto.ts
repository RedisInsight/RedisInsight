import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { Endpoint } from 'src/common/models';
import {
  CliOutputFormatterTypes,
} from 'src/modules/cli/services/cli-business/output-formatter/output-formatter.interface';

export enum CommandExecutionStatus {
  Success = 'success',
  Fail = 'fail',
}

export enum ClusterNodeRole {
  All = 'ALL',
  Master = 'MASTER',
  Slave = 'SLAVE',
}

export class CreateCliClientDto {
  @ApiPropertyOptional({
    type: String,
    example: 'workbench',
    description: 'This namespace will be used in Redis client connection name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  @IsNotEmpty()
  namespace: string;
}

export class SendCommandDto {
  @ApiProperty({
    type: String,
    description: 'Redis CLI command',
  })
  @IsString()
  @IsNotEmpty()
  command: string;

  @ApiPropertyOptional({
    description: 'Define output format',
    default: CliOutputFormatterTypes.Raw,
    enum: CliOutputFormatterTypes,
  })
  @IsOptional()
  @IsEnum(CliOutputFormatterTypes, {
    message: `outputFormat must be a valid enum value. Valid values: ${Object.values(
      CliOutputFormatterTypes,
    )}.`,
  })
  outputFormat?: CliOutputFormatterTypes;
}

export class ClusterSingleNodeOptions extends Endpoint {
  @ApiProperty({
    description: 'Use redirects for OSS Cluster or not.',
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsDefined()
  @Expose()
  enableRedirection: boolean;
}

export class SendCommandResponse {
  @ApiProperty({
    type: String,
    description: 'Redis CLI response',
  })
  response: any;

  @ApiProperty({
    description: 'Redis CLI command execution status',
    default: CommandExecutionStatus.Success,
    enum: CommandExecutionStatus,
  })
  status: CommandExecutionStatus;
}

export class CreateCliClientResponse {
  @ApiProperty({
    type: String,
    description: 'Client uuid',
  })
  uuid: string;
}

export class DeleteClientResponse {
  @ApiProperty({
    description: 'Number of affected clients',
    type: Number,
  })
  affected: number;
}
