import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum, IsArray, IsNotEmptyObject, IsOptional, ArrayNotEmpty, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClusterSingleNodeOptions } from 'src/modules/cli/dto/cli.dto';
import { ClusterNodeRole, WorkbenchMode } from './create-command-execution.dto';

export class CreateCommandExecutionsDto {
  @ApiProperty({
    isArray: true,
    description: 'Redis commands',
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  commands: string[];

  @ApiProperty({
    description: 'Workbench mode',
    default: WorkbenchMode.ASCII,
    enum: WorkbenchMode,
  })
  @IsEnum(WorkbenchMode, {
    message: `mode must be a valid enum value. Valid values: ${Object.values(
      WorkbenchMode,
    )}.`,
  })
  mode: WorkbenchMode;

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
