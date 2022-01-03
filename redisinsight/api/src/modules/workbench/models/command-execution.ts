import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { ClusterNodeRole } from 'src/modules/workbench/dto/create-command-execution.dto';
import { ClusterSingleNodeOptions } from 'src/modules/cli/dto/cli.dto';
import { Expose } from 'class-transformer';

export class CommandExecution {
  @ApiProperty({
    description: 'Command execution id',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Database id',
    type: String,
  })
  @Expose()
  databaseId: string;

  @ApiProperty({
    description: 'Redis command executed',
    type: String,
  })
  @Expose()
  command: string;

  @ApiProperty({
    description: 'Command execution result',
    type: () => CommandExecutionResult,
    isArray: true,
  })
  @Expose()
  result: CommandExecutionResult[];

  @ApiPropertyOptional({
    description: 'Nodes roles where command was executed',
    default: ClusterNodeRole.All,
    enum: ClusterNodeRole,
  })
  @Expose()
  role?: ClusterNodeRole;

  @ApiPropertyOptional({
    description: 'Node where command was executed',
    type: ClusterSingleNodeOptions,
  })
  @Expose()
  nodeOptions?: ClusterSingleNodeOptions;

  @ApiProperty({
    description: 'Date of command execution',
    type: Date,
  })
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<CommandExecution> = {}) {
    Object.assign(this, partial);
  }
}
