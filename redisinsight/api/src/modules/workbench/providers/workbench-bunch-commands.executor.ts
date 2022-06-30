import {
  BadRequestException, Injectable, InternalServerErrorException, Logger,
} from '@nestjs/common';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import {
  ClusterNodeRole, ClusterSingleNodeOptions,
  CommandExecutionStatus,
} from 'src/modules/cli/dto/cli.dto';
import {
  checkHumanReadableCommands,
  checkRedirectionError,
  parseRedirectionError,
  splitCliCommandLine,
} from 'src/utils/cli-helper';
import {
  CommandNotSupportedError,
  CommandParsingError,
  ClusterNodeNotFoundError,
  WrongDatabaseTypeError,
} from 'src/modules/cli/constants/errors';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
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
  ) {}

  public async sendCommand(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: createBunchCommandsExecutionDto,
  ): Promise<CommandExecutionResult[]> {
    const { commands, role, nodeOptions } = dto;

    if (nodeOptions) {
      const result = [];
      await Promise.all(
        commands.map(async (command) => {
          const currentCommandResult = await this.sendCommandForSingleNode(
            clientOptions,
            command,
            role,
            nodeOptions,
          );
          result.push(currentCommandResult)
        }),
      );

      return result;
    }

    if (role) {
      const result = [];
      await Promise.all(
        commands.map(async (command) => {
          const currentCommandResult = await this.sendCommandForNodes(
            clientOptions,
            command,
            role,
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

  private async sendCommandForSingleNode(
    clientOptions: IFindRedisClientInstanceByOptions,
    commandLine: string,
    role: ClusterNodeRole = ClusterNodeRole.All,
    nodeOptions: ClusterSingleNodeOptions,
  ): Promise<CommandExecutionResult> {
    this.logger.log(`Executing redis.cluster CLI command for single node ${JSON.stringify(nodeOptions)}`);
    try {
      const [command, ...args] = splitCliCommandLine(commandLine);
      const replyEncoding = checkHumanReadableCommands(`${command} ${args[0]}`) ? 'utf8' : undefined;

      const nodeAddress = `${nodeOptions.host}:${nodeOptions.port}`;
      let result = await this.redisTool.execCommandForNode(
        clientOptions,
        command,
        args,
        role,
        nodeAddress,
        replyEncoding,
      );
      if (result.error && checkRedirectionError(result.error) && nodeOptions.enableRedirection) {
        const { slot, address } = parseRedirectionError(result.error);
        result = await this.redisTool.execCommandForNode(
          clientOptions,
          command,
          args,
          role,
          address,
          replyEncoding,
        );
        result.slot = parseInt(slot, 10);
      }

      this.analyticsService.sendCommandExecutedEvent(clientOptions.instanceId, result, { command });
      const {
        host, port, error, slot, ...rest
      } = result;

      return {
        ...rest,
        response: this.formatter.format(rest.response),
        node: { host, port, slot },
      };
    } catch (error) {
      this.logger.error('Failed to execute redis.cluster CLI command.', error);
      const result = { response: error.message, status: CommandExecutionStatus.Fail };

      if (error instanceof CommandParsingError || error instanceof CommandNotSupportedError) {
        this.analyticsService.sendCommandExecutedEvent(clientOptions.instanceId, { ...result, error });
        return result;
      }
      this.analyticsService.sendCommandExecutedEvent(clientOptions.instanceId, { ...result, error });

      if (error instanceof WrongDatabaseTypeError || error instanceof ClusterNodeNotFoundError) {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  private async sendCommandForNodes(
    clientOptions: IFindRedisClientInstanceByOptions,
    commandLine: string,
    role: ClusterNodeRole,
  ): Promise<CommandExecutionResult[]> {
    this.logger.log(`Executing redis.cluster CLI command for [${role}] nodes.`);
    try {
      const [command, ...args] = splitCliCommandLine(commandLine);
      const replyEncoding = checkHumanReadableCommands(`${command} ${args[0]}`) ? 'utf8' : undefined;

      return (
        await this.redisTool.execCommandForNodes(clientOptions, command, args, role, replyEncoding)
      ).map((nodeExecReply) => {
        const {
          response, status, host, port,
        } = nodeExecReply;
        const result = {
          response: this.formatter.format(response),
          status,
          node: { host, port },
        };
        this.analyticsService.sendCommandExecutedEvent(clientOptions.instanceId, result, { command });
        return result;
      });
    } catch (error) {
      this.logger.error('Failed to execute redis.cluster CLI command.', error);
      const result = { response: error.message, status: CommandExecutionStatus.Fail };

      if (error instanceof CommandParsingError || error instanceof CommandNotSupportedError) {
        this.analyticsService.sendCommandExecutedEvent(clientOptions.instanceId, { ...result, error });
        return [result];
      }

      this.analyticsService.sendCommandExecutedEvent(clientOptions.instanceId, { ...result, error });
      if (error instanceof WrongDatabaseTypeError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
