import { Injectable } from '@nestjs/common';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { CreateCommandExecutionDto } from 'src/modules/workbench/dto/create-command-execution.dto';
import { CliCommandNotSupportedError } from 'src/modules/cli/constants/errors';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { PluginCommandExecution } from 'src/modules/workbench/models/plugin-command-execution';
import { plainToClass } from 'class-transformer';
import { PluginCommandsWhitelistProvider } from 'src/modules/workbench/providers/plugin-commands-whitelist.provider';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';

@Injectable()
export class PluginsService {
  constructor(
    private commandsExecutor: WorkbenchCommandsExecutor,
    private whitelistProvider: PluginCommandsWhitelistProvider,
  ) {}

  /**
   * Send redis command from workbench and save history
   *
   * @param clientOptions
   * @param dto
   */
  async sendCommand(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateCommandExecutionDto,
  ): Promise<PluginCommandExecution> {
    try {
      await this.checkWhitelistedCommands(clientOptions.instanceId, dto.command);

      const result = await this.commandsExecutor.sendCommand(clientOptions, dto);

      return plainToClass(PluginCommandExecution, {
        ...dto,
        databaseId: clientOptions.instanceId,
        result,
      });
    } catch (error) {
      if (error instanceof CliCommandNotSupportedError) {
        return new PluginCommandExecution({
          ...dto,
          databaseId: clientOptions.instanceId,
          result: [new CommandExecutionResult({
            response: error.message,
            status: CommandExecutionStatus.Fail,
          })],
        });
      }

      throw error;
    }
  }

  /**
   * Get database white listed commands for plugins
   * @param instanceId
   */
  async getWhitelistCommands(instanceId: string): Promise<string[]> {
    return await this.whitelistProvider.getWhitelistCommands(instanceId);
  }

  /**
   * Check if command outside workbench commands black list
   * @param databaseId
   * @param commandLine
   * @private
   */
  private async checkWhitelistedCommands(databaseId: string, commandLine: string) {
    const targetCommand = commandLine.toLowerCase();

    const isWhiteListed = (await this.getWhitelistCommands(databaseId))
      .find((command) => targetCommand.startsWith(command));

    if (!isWhiteListed) {
      throw new CliCommandNotSupportedError(
        ERROR_MESSAGES.PLUGIN_COMMAND_NOT_SUPPORTED(
          (targetCommand.split(' '))[0].toUpperCase(),
        ),
      );
    }
  }
}
