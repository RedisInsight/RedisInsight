import {
  BadRequestException, Injectable, InternalServerErrorException, Logger,
} from '@nestjs/common';
import { IFindRedisClientInstanceByOptions } from 'src/modules/redis/redis.service';
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
import { CreateCommandExecutionDto, RunQueryMode } from 'src/modules/workbench/dto/create-command-execution.dto';
import { RedisToolService } from 'src/modules/redis/redis-tool.service';
import {
  FormatterManager,
  FormatterTypes,
  ASCIIFormatterStrategy,
  UTF8FormatterStrategy,
} from 'src/common/transformers';
import { WorkbenchAnalyticsService } from '../services/workbench-analytics/workbench-analytics.service';

@Injectable()
export class WorkbenchCommandsExecutor {
  private logger = new Logger('WorkbenchCommandsExecutor');

  private formatterManager: FormatterManager;

  constructor(
    private redisTool: RedisToolService,
    private analyticsService: WorkbenchAnalyticsService,
  ) {
    this.formatterManager = new FormatterManager();
    this.formatterManager.addStrategy(
      FormatterTypes.UTF8,
      new UTF8FormatterStrategy(),
    );
    this.formatterManager.addStrategy(
      FormatterTypes.ASCII,
      new ASCIIFormatterStrategy(),
    );
  }

  /**
   * Entrypoint for any CommandExecution
   * Will determine type of a command (standalone, per node(s)) and format, and execute it
   * Also sis a single place of analytics events invocation
   * @param clientOptions
   * @param dto
   */
  public async sendCommand(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateCommandExecutionDto,
  ): Promise<CommandExecutionResult[]> {
    let result;

    const {
      command: commandLine,
      role,
      nodeOptions,
      mode,
    } = dto;

    const [command, ...commandArgs] = splitCliCommandLine(commandLine);

    try {
      if (nodeOptions) {
        result = [await this.sendCommandForSingleNode(
          clientOptions,
          command,
          commandArgs,
          role,
          mode,
          nodeOptions,
        )];
      } else if (role) {
        result = await this.sendCommandForNodes(
          clientOptions,
          command,
          commandArgs,
          role,
          mode,
        );
      } else {
        result = [await this.sendCommandForStandalone(
          clientOptions,
          command,
          commandArgs,
          mode,
        )];
      }

      this.analyticsService.sendCommandExecutedEvents(
        clientOptions.instanceId,
        result,
        { command, rawMode: mode === RunQueryMode.Raw },
      );

      return result;
    } catch (error) {
      this.logger.error('Failed to execute workbench command.', error);

      const errorResult = { response: error.message, status: CommandExecutionStatus.Fail };
      this.analyticsService.sendCommandExecutedEvent(
        clientOptions.instanceId,
        { ...errorResult, error },
        { command, rawMode: dto.mode === RunQueryMode.Raw },
      );

      if (
        error instanceof CommandParsingError
        || error instanceof CommandNotSupportedError
        || error.name === 'ReplyError'
      ) {
        return [errorResult];
      }

      if (error instanceof WrongDatabaseTypeError || error instanceof ClusterNodeNotFoundError) {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Sends command for standalone instances
   * @param clientOptions
   * @param command
   * @param commandArgs
   * @param mode
   * @private
   */
  private async sendCommandForStandalone(
    clientOptions: IFindRedisClientInstanceByOptions,
    command: string,
    commandArgs: string[],
    mode: RunQueryMode,
  ): Promise<CommandExecutionResult> {
    this.logger.log('Executing workbench command.');

    const formatter = this.getFormatter(mode);

    const replyEncoding = checkHumanReadableCommands(`${command} ${commandArgs[0]}`) ? 'utf8' : undefined;

    const response = formatter.format(
      await this.redisTool.execCommand(clientOptions, command, commandArgs, replyEncoding),
    );

    this.logger.log('Succeed to execute workbench command.');

    return { response, status: CommandExecutionStatus.Success };
  }

  /**
   * Sends command for a single node in cluster by host and port (nodeOptions)
   * @param clientOptions
   * @param command
   * @param commandArgs
   * @param role
   * @param mode
   * @param nodeOptions
   * @private
   */
  private async sendCommandForSingleNode(
    clientOptions: IFindRedisClientInstanceByOptions,
    command: string,
    commandArgs: string[],
    role: ClusterNodeRole = ClusterNodeRole.All,
    mode: RunQueryMode = RunQueryMode.ASCII,
    nodeOptions: ClusterSingleNodeOptions,
  ): Promise<CommandExecutionResult> {
    this.logger.log(`Executing redis.cluster CLI command for single node ${JSON.stringify(nodeOptions)}`);

    const formatter = this.getFormatter(mode);

    const replyEncoding = checkHumanReadableCommands(`${command} ${commandArgs[0]}`) ? 'utf8' : undefined;

    const nodeAddress = `${nodeOptions.host}:${nodeOptions.port}`;
    let result = await this.redisTool.execCommandForNode(
      clientOptions,
      command,
      commandArgs,
      role,
      nodeAddress,
      replyEncoding,
    );
    if (result.error && checkRedirectionError(result.error) && nodeOptions.enableRedirection) {
      const { slot, address } = parseRedirectionError(result.error);
      result = await this.redisTool.execCommandForNode(
        clientOptions,
        command,
        commandArgs,
        role,
        address,
        replyEncoding,
      );
      result.slot = parseInt(slot, 10);
    }

    const {
      host, port, error, slot, ...rest
    } = result;

    return {
      ...rest,
      response: formatter.format(rest.response),
      node: { host, port, slot },
    };
  }

  /**
   * Sends commands for multiple nodes in cluster based on their role
   * @param clientOptions
   * @param command
   * @param commandArgs
   * @param role
   * @param mode
   * @private
   */
  private async sendCommandForNodes(
    clientOptions: IFindRedisClientInstanceByOptions,
    command: string,
    commandArgs: string[],
    role: ClusterNodeRole,
    mode: RunQueryMode = RunQueryMode.ASCII,
  ): Promise<CommandExecutionResult[]> {
    this.logger.log(`Executing redis.cluster CLI command for [${role}] nodes.`);

    const formatter = this.getFormatter(mode);

    const replyEncoding = checkHumanReadableCommands(`${command} ${commandArgs[0]}`) ? 'utf8' : undefined;

    return (
      await this.redisTool.execCommandForNodes(clientOptions, command, commandArgs, role, replyEncoding)
    ).map((nodeExecReply) => {
      const {
        response, status, host, port,
      } = nodeExecReply;
      return {
        response: formatter.format(response),
        status,
        node: { host, port },
      };
    });
  }

  /**
   * Get formatter strategy based on "mode"
   * @param mode
   * @private
   */
  private getFormatter(mode: RunQueryMode) {
    switch (mode) {
      case RunQueryMode.Raw:
        return this.formatterManager.getStrategy(FormatterTypes.UTF8);
      case RunQueryMode.ASCII:
      default: {
        return this.formatterManager.getStrategy(FormatterTypes.ASCII);
      }
    }
  }
}
