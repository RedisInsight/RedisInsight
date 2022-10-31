import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
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

class ClusterNode extends Endpoint {
  @ApiPropertyOptional({
    description: 'Cluster node slot.',
    type: Number,
    example: 0,
  })
  slot?: number;
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
  enableRedirection: boolean;
}

export class SendClusterCommandDto extends SendCommandDto {
  @ApiProperty({
    description: 'Execute command for nodes with defined role',
    default: ClusterNodeRole.All,
    enum: ClusterNodeRole,
  })
  @IsDefined()
  @IsEnum(ClusterNodeRole, {
    message: `role must be a valid enum value. Valid values: ${Object.values(
      ClusterNodeRole,
    )}.`,
  })
  role: ClusterNodeRole;

  @ApiPropertyOptional({
    description:
      'Should be provided if only one node needs to execute the command.',
    type: ClusterSingleNodeOptions,
  })
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => ClusterSingleNodeOptions)
  @ValidateNested()
  nodeOptions?: ClusterSingleNodeOptions;
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

export class SendClusterCommandResponse {
  @ApiProperty({
    type: String,
    description: 'Redis CLI response',
  })
  response: any;

  @ApiPropertyOptional({
    type: () => ClusterNode,
    description: 'Redis Cluster Node info',
  })
  node?: ClusterNode;

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
