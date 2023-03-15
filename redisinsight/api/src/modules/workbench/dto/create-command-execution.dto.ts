import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClusterSingleNodeOptions } from 'src/modules/cli/dto/cli.dto';

export enum ClusterNodeRole {
  All = 'ALL',
  Master = 'MASTER',
  Slave = 'SLAVE',
}

export enum RunQueryMode {
  Raw = 'RAW',
  ASCII = 'ASCII',
}

export enum ResultsMode {
  Default = 'DEFAULT',
  GroupMode = 'GROUP_MODE',
  Silent = 'SILENT',
}

export class CreateCommandExecutionDto {
  @ApiProperty({
    type: String,
    description: 'Redis command',
  })
  @IsString()
  @IsNotEmpty()
  command: string;

  @ApiPropertyOptional({
    description: 'Workbench mode',
    default: RunQueryMode.ASCII,
    enum: RunQueryMode,
  })
  @IsOptional()
  @IsEnum(RunQueryMode, {
    message: `mode must be a valid enum value. Valid values: ${Object.values(
      RunQueryMode,
    )}.`,
  })
  mode?: RunQueryMode = RunQueryMode.ASCII;

  @ApiPropertyOptional({
    description: 'Workbench group mode',
    default: ResultsMode.Default,
    enum: ResultsMode,
  })
  @IsOptional()
  @IsEnum(ResultsMode, {
    message: `resultsMode must be a valid enum value. Valid values: ${Object.values(
      ResultsMode,
    )}.`,
  })
  resultsMode?: ResultsMode;

  @ApiPropertyOptional({
    description: 'Execute command for nodes with defined role',
    default: ClusterNodeRole.All,
    enum: ClusterNodeRole,
  })
  @IsOptional()
  @IsEnum(ClusterNodeRole, {
    message: `role must be a valid enum value. Valid values: ${Object.values(
      ClusterNodeRole,
    )}.`,
  })
  role?: ClusterNodeRole;

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
