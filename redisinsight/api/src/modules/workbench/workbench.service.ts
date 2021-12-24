import { Injectable } from '@nestjs/common';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { CommandExecutionProvider } from 'src/modules/workbench/providers/command-execution.provider';
import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { CreateCommandExecutionDto } from 'src/modules/workbench/dto/create-command-execution.dto';
import { getBlockingCommands, getUnsupportedCommands } from 'src/utils/cli-helper';
import { CliCommandNotSupportedError } from 'src/modules/cli/constants/errors';
import ERROR_MESSAGES from 'src/constants/error-messages';

@Injectable()
export class WorkbenchService {
  constructor(
    private commandsExecutor: WorkbenchCommandsExecutor,
    private commandExecutionProvider: CommandExecutionProvider,
  ) {}

  /**
   * Send redis command from workbench and save history
   *
   * @param clientOptions
   * @param dto
   */
  async createCommandExecution(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateCommandExecutionDto,
  ): Promise<CommandExecution> {
    this.checkUnsupportedCommands(dto.command);

    const result = await this.commandsExecutor.sendCommand(clientOptions, dto);

    return await this.commandExecutionProvider.create({
      ...dto,
      databaseId: clientOptions.instanceId,
      result,
    });
  }

  /**
   * Get list command execution history per instance (last 30 items)
   *
   * @param databaseId
   */
  async listCommandExecutions(databaseId: string): Promise<CommandExecution[]> {
    return this.commandExecutionProvider.getList(databaseId);
  }

  /**
   * Get command execution details
   *
   * @param databaseId
   * @param id
   */
  async getCommandExecution(databaseId: string, id: string): Promise<CommandExecution> {
    return this.commandExecutionProvider.getOne(databaseId, id);
  }

  /**
   * Check if command outside workbench commands black list
   * @param commandLine
   * @private
   */
  private checkUnsupportedCommands(commandLine: string) {
    const targetCommand = commandLine.toLowerCase();
    const unsupportedCommand = getUnsupportedCommands()
      .concat(getBlockingCommands())
      .find((command) => targetCommand.startsWith(command));
    if (unsupportedCommand) {
      throw new CliCommandNotSupportedError(
        ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(
          unsupportedCommand.toUpperCase(),
        ),
      );
    }
  }
}
