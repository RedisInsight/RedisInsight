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

export class CreateCommandExecutionDto {
  @ApiProperty({
    type: String,
    description: 'Redis command',
  })
  @IsString()
  @IsNotEmpty()
  command: string;

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
