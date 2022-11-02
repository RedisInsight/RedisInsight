import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { CommandExecutionProvider } from 'src/modules/workbench/providers/command-execution.provider';
import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { CreateCommandExecutionDto, ResultsMode } from 'src/modules/workbench/dto/create-command-execution.dto';
import { CreateCommandExecutionsDto } from 'src/modules/workbench/dto/create-command-executions.dto';
import { getBlockingCommands, multilineCommandToOneLine } from 'src/utils/cli-helper';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ShortCommandExecution } from 'src/modules/workbench/models/short-command-execution';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { getUnsupportedCommands } from './utils/getUnsupportedCommands';
import { WorkbenchAnalyticsService } from './services/workbench-analytics/workbench-analytics.service';

@Injectable()
export class WorkbenchService {
  constructor(
    private commandsExecutor: WorkbenchCommandsExecutor,
    private commandExecutionProvider: CommandExecutionProvider,
    private analyticsService: WorkbenchAnalyticsService,
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
  ): Promise<Partial<CommandExecution>> {
    const commandExecution: Partial<CommandExecution> = {
      ...omit(dto, 'commands'),
      databaseId: clientOptions.instanceId,
    };

    const command = multilineCommandToOneLine(dto.command);
    const deprecatedCommand = this.findCommandInBlackList(command);
    if (deprecatedCommand) {
      commandExecution.result = [
        {
          response: ERROR_MESSAGES.WORKBENCH_COMMAND_NOT_SUPPORTED(deprecatedCommand.toUpperCase()),
          status: CommandExecutionStatus.Fail,
        },
      ];
    } else {
      const startCommandExecutionTime = process.hrtime();
      commandExecution.result = await this.commandsExecutor.sendCommand(clientOptions, { ...dto, command });
      const [,executionTimeInNanoseconds] = process.hrtime(startCommandExecutionTime);
      commandExecution.executionTime = executionTimeInNanoseconds;
    }

    return commandExecution;
  }

  /**
   * Send redis command from workbench and save history
   *
   * @param clientOptions
   * @param dto
   */
  async createCommandsExecution(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: Partial<CreateCommandExecutionDto>,
    commands: string[],
  ): Promise<Partial<CommandExecution>> {
    const commandExecution: Partial<CommandExecution> = {
      ...dto,
      databaseId: clientOptions.instanceId,
    };
    const startCommandExecutionTime = process.hrtime();

    const executionResults = await Promise.all(commands.map(async (singleCommand) => {
      const command = multilineCommandToOneLine(singleCommand);
      const deprecatedCommand = this.findCommandInBlackList(command);
      if (deprecatedCommand) {
        return ({
          command,
          response: ERROR_MESSAGES.WORKBENCH_COMMAND_NOT_SUPPORTED(deprecatedCommand.toUpperCase()),
          status: CommandExecutionStatus.Fail,
        });
      }
      const result = await this.commandsExecutor.sendCommand(clientOptions, { ...dto, command });
      return ({ ...result[0], command });
    }));

    const [,executionTimeInNanoseconds] = process.hrtime(startCommandExecutionTime);
    commandExecution.executionTime = executionTimeInNanoseconds;

    const successCommands = executionResults.filter(
      (command) => command.status === CommandExecutionStatus.Success,
    );
    const failedCommands = executionResults.filter(
      (command) => command.status === CommandExecutionStatus.Fail,
    );

    commandExecution.summary = {
      total: executionResults.length,
      success: successCommands.length,
      fail: failedCommands.length,
    };

    commandExecution.command = commands.join('\r\n');
    commandExecution.result = [{
      status: CommandExecutionStatus.Success,
      response: executionResults,
    }];

    return commandExecution;
  }

  /**
   * Send redis command from workbench and save history
   *
   * @param clientOptions
   * @param dto
   */
  async createCommandExecutions(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateCommandExecutionsDto,
  ): Promise<CommandExecution[]> {
    if (dto.resultsMode === ResultsMode.GroupMode) {
      return await this.commandExecutionProvider.createMany(
        [await this.createCommandsExecution(clientOptions, dto, dto.commands)],
      );
    }
    // todo: rework to support pipeline
    // prepare and execute commands
    const commandExecutions = await Promise.all(
      dto.commands.map(async (command) => await this.createCommandExecution(clientOptions, { ...dto, command })),
    );

    // save history
    // todo: rework
    return this.commandExecutionProvider.createMany(commandExecutions);
  }

  /**
   * Get list command execution history per instance (last 30 items)
   *
   * @param databaseId
   */
  async listCommandExecutions(databaseId: string): Promise<ShortCommandExecution[]> {
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
   * Delete command execution by id and databaseId
   *
   * @param databaseId
   * @param id
   */
  async deleteCommandExecution(databaseId: string, id: string): Promise<void> {
    await this.commandExecutionProvider.delete(databaseId, id);
    this.analyticsService.sendCommandDeletedEvent(databaseId);
  }

  /**
   * Check if workbench allows such command
   * @param commandLine
   * @private
   */
  private findCommandInBlackList(commandLine: string): string {
    const targetCommand = commandLine.toLowerCase();
    return getUnsupportedCommands()
      .concat(getBlockingCommands())
      .find((command) => targetCommand.startsWith(command));
  }
}
