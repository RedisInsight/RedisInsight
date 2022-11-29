import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { Endpoint } from 'src/common/models';

class ClusterNode extends Endpoint {
  @ApiPropertyOptional({
    description: 'Cluster node slot.',
    type: Number,
    example: 0,
  })
  slot?: number;
}

export class CommandExecutionResult {
  @ApiProperty({
    description: 'Redis CLI command execution status',
    default: CommandExecutionStatus.Success,
    enum: CommandExecutionStatus,
  })
  status: CommandExecutionStatus;

  @ApiProperty({
    type: String,
    description: 'Redis response',
  })
  response: any;

  @ApiPropertyOptional({
    type: () => ClusterNode,
    description: 'Redis Cluster Node info',
  })
  node?: ClusterNode;

  constructor(partial: Partial<CommandExecutionResult> = {}) {
    Object.assign(this, partial);
  }
}
