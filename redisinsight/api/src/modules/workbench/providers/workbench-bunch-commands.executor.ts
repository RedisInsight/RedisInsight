import { Injectable, Logger } from '@nestjs/common';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { checkHumanReadableCommands, splitCliCommandLine } from 'src/utils/cli-helper';
import { CommandNotSupportedError, CommandParsingError } from 'src/modules/cli/constants/errors';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { createBunchCommandsExecutionDto } from 'src/modules/workbench/dto/create-commands-execution.dto';
import { RedisToolService } from 'src/modules/shared/services/base/redis-tool.service';
import { RawFormatterStrategy } from 'src/modules/cli/services/cli-business/output-formatter/strategies/raw-formatter.strategy';
import { WorkbenchAnalyticsService } from '../services/workbench-analytics/workbench-analytics.service';


@Injectable()
export class WorkbenchBunchCommandsExecutor {
  private logger = new Logger('WorkbenchCommandsExecutor');

  private formatter = new RawFormatterStrategy();

  constructor(
    private redisTool: RedisToolService,
    private analyticsService: WorkbenchAnalyticsService,
    private commandsExecutor: WorkbenchCommandsExecutor,
  ) {}

  public async sendCommand(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: createBunchCommandsExecutionDto,
  ): Promise<CommandExecutionResult[]> {
    const { commands, role, nodeOptions } = dto;

    if (nodeOptions || role) {
      const result = [];
      await Promise.all(
        commands.map(async (command) => {
          const currentCommandResult = await this.commandsExecutor.sendCommand(
            clientOptions,
            { ...dto, command },
          );
          result.push(currentCommandResult)
        }),
      );

      return result;
    }

    return await this.sendCommandsForStandalone(clientOptions, dto);
  }

  private async sendCommandsForStandalone(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: createBunchCommandsExecutionDto,
  ): Promise<CommandExecutionResult[]> {
    this.logger.log('Executing workbench commands.');
    let results: CommandExecutionResult[] = [];
    const { commands } = dto;

    for (let i = 0; i < commands.length; i++) {
      try {
        const [command, ...args] = splitCliCommandLine(commands[i]);
        const replyEncoding = checkHumanReadableCommands(`${command} ${args[0]}`) ? 'utf8' : undefined;
        const response = this.formatter.format(
          await this.redisTool.execCommand(clientOptions, command, args, replyEncoding),
        );
  
        this.logger.log('Succeed to execute workbench commands.');
  
        const result = { response, status: CommandExecutionStatus.Success };
        this.analyticsService.sendCommandExecutedEvent(clientOptions.instanceId, result, { command });
        results.push(result);
      } catch (error) {
        this.logger.error('Failed to execute workbench commands.', error);
        console.log()
        const result = { response: error.message, status: CommandExecutionStatus.Fail };
        if (
          error instanceof CommandParsingError
          || error instanceof CommandNotSupportedError
          || error.name === 'ReplyError'
        ) {
          this.analyticsService.sendCommandExecutedEvent(clientOptions.instanceId, { ...result, error });
          results.push(result)
        }
        this.analyticsService.sendCommandExecutedEvent(clientOptions.instanceId, { ...result, error });
        // throw new InternalServerErrorException(error.message);
      }
      return results;
    }
  }
}
