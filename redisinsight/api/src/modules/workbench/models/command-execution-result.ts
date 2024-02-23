import { ApiProperty } from '@nestjs/swagger';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';

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

  constructor(partial: Partial<CommandExecutionResult> = {}) {
    Object.assign(this, partial);
  }
}
