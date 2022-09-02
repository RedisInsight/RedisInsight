import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { OmitType, PartialType } from '@nestjs/swagger';

export class PluginCommandExecution extends PartialType(
  OmitType(CommandExecution, ['updatedAt', 'id'] as const),
) {
  constructor(partial: Partial<PluginCommandExecution>) {
    super();
    Object.assign(this, partial);
  }
}
