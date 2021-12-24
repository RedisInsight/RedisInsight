import {
  BadRequestException, Injectable, InternalServerErrorException, Logger,
} from '@nestjs/common';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import {
  ClusterNodeRole, ClusterSingleNodeOptions,
  CommandExecutionStatus,
} from 'src/modules/cli/dto/cli.dto';
import { checkRedirectionError, parseRedirectionError, splitCliCommandLine } from 'src/utils/cli-helper';
import {
  CliCommandNotSupportedError,
  CliParsingError,
  ClusterNodeNotFoundError,
  WrongDatabaseTypeError,
} from 'src/modules/cli/constants/errors';
import { CliToolService } from 'src/modules/cli/services/cli-tool/cli-tool.service';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { CreateCommandExecutionDto } from 'src/modules/workbench/dto/create-command-execution.dto';

@Injectable()
export class WorkbenchCommandsExecutor {
  private logger = new Logger('WorkbenchCommandsExecutor');

  constructor(private cliTool: CliToolService) {}

  public async sendCommand(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateCommandExecutionDto,
  ): Promise<CommandExecutionResult[]> {
    const { command, role, nodeOptions } = dto;

    if (nodeOptions) {
      const result = await this.sendCommandForSingleNode(
        clientOptions,
        command,
        role,
        nodeOptions,
      );

      return [result];
    }

    if (role) {
      return this.sendCommandForNodes(clientOptions, command, role);
    }

    return [await this.sendCommandForStandalone(clientOptions, dto)];
  }

  private async sendCommandForStandalone(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: CreateCommandExecutionDto,
  ): Promise<CommandExecutionResult> {
    this.logger.log('Executing workbench command.');
    const { command: commandLine } = dto;

    try {
      const [command, ...args] = splitCliCommandLine(commandLine);
      const response = await this.cliTool.execCommand(clientOptions, command, args, 'utf-8');
      this.logger.log('Succeed to execute workbench command.');
      return {
        response,
        status: CommandExecutionStatus.Success,
      };
    } catch (error) {
      this.logger.error('Failed to execute workbench command.', error);

      if (
        error instanceof CliParsingError
        || error instanceof CliCommandNotSupportedError
        || error.name === 'ReplyError'
      ) {
        return { response: error.message, status: CommandExecutionStatus.Fail };
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  private async sendCommandForSingleNode(
    clientOptions: IFindRedisClientInstanceByOptions,
    commandLine: string,
    role: ClusterNodeRole,
    nodeOptions: ClusterSingleNodeOptions,
  ): Promise<CommandExecutionResult> {
    this.logger.log(`Executing redis.cluster CLI command for single node ${JSON.stringify(nodeOptions)}`);
    try {
      const [command, ...args] = splitCliCommandLine(commandLine);
      // this.checkUnsupportedCommands(`${command} ${args[0]}`);
      const nodeAddress = `${nodeOptions.host}:${nodeOptions.port}`;
      let result = await this.cliTool.execCommandForNode(
        clientOptions,
        command,
        args,
        role,
        nodeAddress,
        'utf-8',
      );
      if (result.error && checkRedirectionError(result.error) && nodeOptions.enableRedirection) {
        const { slot, address } = parseRedirectionError(result.error);
        result = await this.cliTool.execCommandForNode(
          clientOptions,
          command,
          args,
          role,
          address,
          'utf-8',
        );
        result.slot = parseInt(slot, 10);
      }

      const {
        host, port, error, slot, ...rest
      } = result;
      return { ...rest, node: { host, port, slot } };
    } catch (error) {
      this.logger.error('Failed to execute redis.cluster CLI command.', error);

      if (error instanceof CliParsingError || error instanceof CliCommandNotSupportedError) {
        return { response: error.message, status: CommandExecutionStatus.Fail };
      }

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

      const result = await this.cliTool.execCommandForNodes(
        clientOptions,
        command,
        args,
        role,
        'utf-8',
      );

      return result.map((nodeExecReply) => {
        const {
          response, status, host, port,
        } = nodeExecReply;
        return {
          response,
          status,
          node: { host, port },
        };
      });
    } catch (error) {
      this.logger.error('Failed to execute redis.cluster CLI command.', error);

      if (error instanceof CliParsingError || error instanceof CliCommandNotSupportedError) {
        return [
          { response: error.message, status: CommandExecutionStatus.Fail },
        ];
      }

      if (error instanceof WrongDatabaseTypeError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
