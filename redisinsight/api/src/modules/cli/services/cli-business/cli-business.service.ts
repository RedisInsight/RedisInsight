import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CliToolService } from 'src/modules/cli/services/cli-tool/cli-tool.service';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import {
  ClusterNodeRole,
  ClusterSingleNodeOptions,
  CommandExecutionStatus,
  CreateCliClientResponse,
  DeleteClientResponse,
  SendClusterCommandDto,
  SendClusterCommandResponse,
  SendCommandDto,
  SendCommandResponse,
} from 'src/modules/cli/dto/cli.dto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  checkHumanReadableCommands,
  checkRedirectionError,
  getUnsupportedCommands,
  parseRedirectionError,
  splitCliCommandLine,
} from 'src/utils/cli-helper';
import {
  CliCommandNotSupportedError,
  CliParsingError,
  ClusterNodeNotFoundError,
  WrongDatabaseTypeError,
} from 'src/modules/cli/constants/errors';
import { CliAnalyticsService } from 'src/modules/cli/services/cli-analytics/cli-analytics.service';
import { EncryptionServiceErrorException } from 'src/modules/core/encryption/exceptions';
import { AppTool } from 'src/models';
import { OutputFormatterManager } from './output-formatter/output-formatter-manager';
import { CliOutputFormatterTypes } from './output-formatter/output-formatter.interface';
import { TextFormatterStrategy } from './output-formatter/strategies/text-formatter.strategy';
import { RawFormatterStrategy } from './output-formatter/strategies/raw-formatter.strategy';

@Injectable()
export class CliBusinessService {
  private logger = new Logger('CliService');

  private outputFormatterManager: OutputFormatterManager;

  constructor(
    private cliTool: CliToolService,
    private cliAnalyticsService: CliAnalyticsService,
  ) {
    this.outputFormatterManager = new OutputFormatterManager();
    this.outputFormatterManager.addStrategy(
      CliOutputFormatterTypes.Text,
      new TextFormatterStrategy(),
    );
    this.outputFormatterManager.addStrategy(
      CliOutputFormatterTypes.Raw,
      new RawFormatterStrategy(),
    );
  }

  /**
   * Method to create new redis client and return uuid
   * @param instanceId
   * @param namespace
   */
  public async getClient(
    instanceId: string,
    namespace: string = AppTool.CLI,
  ): Promise<CreateCliClientResponse> {
    this.logger.log('Create Redis client for CLI.');
    try {
      const uuid = await this.cliTool.createNewToolClient(instanceId, namespace);
      this.logger.log('Succeed to create Redis client for CLI.');
      this.cliAnalyticsService.sendClientCreatedEvent(instanceId, namespace);
      return { uuid };
    } catch (error) {
      this.logger.error('Failed to create redis client for CLI.', error);
      this.cliAnalyticsService.sendClientCreationFailedEvent(instanceId, namespace, error);
      throw error;
    }
  }

  /**
   * Method to close exist client and create a new one
   * @param instanceId
   * @param uuid
   * @param namespace
   */
  public async reCreateClient(
    instanceId: string,
    uuid: string,
    namespace: string = AppTool.CLI,
  ): Promise<CreateCliClientResponse> {
    this.logger.log('re-create Redis client for CLI.');
    try {
      const clientUuid = await this.cliTool.reCreateToolClient(instanceId, uuid, namespace);
      this.logger.log('Succeed to re-create Redis client for CLI.');
      this.cliAnalyticsService.sendClientRecreatedEvent(instanceId, namespace);
      return { uuid: clientUuid };
    } catch (error) {
      this.logger.error('Failed to re-create redis client for CLI.', error);
      this.cliAnalyticsService.sendClientCreationFailedEvent(instanceId, namespace, error);
      throw error;
    }
  }

  /**
   * Method to close exist redis client
   * @param instanceId
   * @param uuid
   */
  public async deleteClient(
    instanceId: string,
    uuid: string,
  ): Promise<DeleteClientResponse> {
    this.logger.log('Deleting Redis client for CLI.');
    try {
      const namespace = this.cliTool.getRedisClientNamespace({ instanceId, uuid });
      const affected = await this.cliTool.deleteToolClient(instanceId, uuid);
      this.logger.log('Succeed to delete Redis client for CLI.');
      if (affected) {
        this.cliAnalyticsService.sendClientDeletedEvent(affected, instanceId, namespace);
      }
      return { affected };
    } catch (error) {
      this.logger.error('Failed to delete Redis client for CLI.', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Method to execute cli command for redis client and return result
   * @param clientOptions
   * @param dto
   */
  public async sendCommand(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: SendCommandDto,
  ): Promise<SendCommandResponse> {
    this.logger.log('Executing redis CLI command.');
    const { command: commandLine } = dto;
    let namespace = AppTool.CLI.toString();
    const outputFormat = dto.outputFormat || CliOutputFormatterTypes.Raw;
    try {
      const formatter = this.outputFormatterManager.getStrategy(outputFormat);
      const [command, ...args] = splitCliCommandLine(commandLine);
      const replyEncoding = checkHumanReadableCommands(`${command} ${args[0]}`) ? 'utf8' : undefined;
      this.checkUnsupportedCommands(`${command} ${args[0]}`);

      const reply = await this.cliTool.execCommand(clientOptions, command, args, replyEncoding);
      namespace = this.cliTool.getRedisClientNamespace(clientOptions);

      this.logger.log('Succeed to execute redis CLI command.');
      this.cliAnalyticsService.sendCommandExecutedEvent(
        clientOptions.instanceId,
        namespace,
        {
          command,
          outputFormat,
        },
      );
      return {
        response: formatter.format(reply),
        status: CommandExecutionStatus.Success,
      };
    } catch (error) {
      this.logger.error('Failed to execute redis CLI command.', error);

      if (
        error instanceof CliParsingError
        || error instanceof CliCommandNotSupportedError
        || error?.name === 'ReplyError'
      ) {
        this.cliAnalyticsService.sendCommandErrorEvent(clientOptions.instanceId, namespace, error);
        return { response: error.message, status: CommandExecutionStatus.Fail };
      }
      this.cliAnalyticsService.sendConnectionErrorEvent(clientOptions.instanceId, namespace, error);

      if (error instanceof EncryptionServiceErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Method to execute cli command for redis.cluster client and return result
   * @param clientOptions
   * @param dto
   */
  public async sendClusterCommand(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: SendClusterCommandDto,
  ): Promise<SendClusterCommandResponse[]> {
    this.logger.log('Executing redis.cluster CLI command.');
    const {
      command, role, nodeOptions, outputFormat,
    } = dto;
    if (nodeOptions) {
      const result = await this.sendCommandForSingleNode(
        clientOptions,
        command,
        role,
        nodeOptions,
        outputFormat,
      );
      return [result];
    }
    return this.sendCommandForNodes(clientOptions, command, role, outputFormat);
  }

  public async sendCommandForNodes(
    clientOptions: IFindRedisClientInstanceByOptions,
    commandLine: string,
    role: ClusterNodeRole,
    outputFormat: CliOutputFormatterTypes = CliOutputFormatterTypes.Raw,
  ): Promise<SendClusterCommandResponse[]> {
    let namespace = AppTool.CLI.toString();
    this.logger.log(`Executing redis.cluster CLI command for [${role}] nodes.`);
    try {
      const formatter = this.outputFormatterManager.getStrategy(outputFormat);
      const [command, ...args] = splitCliCommandLine(commandLine);
      const replyEncoding = checkHumanReadableCommands(`${command} ${args[0]}`) ? 'utf8' : undefined;
      this.checkUnsupportedCommands(`${command} ${args[0]}`);
      const result = await this.cliTool.execCommandForNodes(
        clientOptions,
        command,
        args,
        role,
        replyEncoding,
      );

      namespace = this.cliTool.getRedisClientNamespace(clientOptions);
      return result.map((nodeExecReply) => {
        this.cliAnalyticsService.sendClusterCommandExecutedEvent(
          clientOptions.instanceId,
          namespace,
          nodeExecReply,
          { command, outputFormat },
        );
        const {
          response, status, host, port,
        } = nodeExecReply;
        return {
          response: formatter.format(response),
          status,
          node: { host, port },
        };
      });
    } catch (error) {
      this.logger.error('Failed to execute redis.cluster CLI command.', error);

      if (error instanceof CliParsingError || error instanceof CliCommandNotSupportedError) {
        this.cliAnalyticsService.sendCommandErrorEvent(clientOptions.instanceId, namespace, error);
        return [
          { response: error.message, status: CommandExecutionStatus.Fail },
        ];
      }

      this.cliAnalyticsService.sendConnectionErrorEvent(clientOptions.instanceId, namespace, error);

      if (error instanceof EncryptionServiceErrorException) {
        throw error;
      }

      if (error instanceof WrongDatabaseTypeError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  public async sendCommandForSingleNode(
    clientOptions: IFindRedisClientInstanceByOptions,
    commandLine: string,
    role: ClusterNodeRole,
    nodeOptions: ClusterSingleNodeOptions,
    outputFormat: CliOutputFormatterTypes = CliOutputFormatterTypes.Raw,
  ): Promise<SendClusterCommandResponse> {
    this.logger.log(`Executing redis.cluster CLI command for single node ${JSON.stringify(nodeOptions)}`);
    try {
      const formatter = this.outputFormatterManager.getStrategy(outputFormat);
      const [command, ...args] = splitCliCommandLine(commandLine);
      const replyEncoding = checkHumanReadableCommands(`${command} ${args[0]}`) ? 'utf8' : undefined;
      this.checkUnsupportedCommands(`${command} ${args[0]}`);
      const nodeAddress = `${nodeOptions.host}:${nodeOptions.port}`;
      let result = await this.cliTool.execCommandForNode(
        clientOptions,
        command,
        args,
        role,
        nodeAddress,
        replyEncoding,
      );
      if (result?.error && checkRedirectionError(result.error) && nodeOptions.enableRedirection) {
        const { slot, address } = parseRedirectionError(result.error);
        result = await this.cliTool.execCommandForNode(
          clientOptions,
          command,
          args,
          role,
          address,
          replyEncoding,
        );
        result.response = formatter.format(result.response, { slot, address });
        result.slot = parseInt(slot, 10);
      } else {
        result.response = formatter.format(result.response);
      }
      this.cliAnalyticsService.sendClusterCommandExecutedEvent(
        clientOptions.instanceId,
        'cli',
        result,
        { command, outputFormat },
      );
      const {
        host, port, error, slot, ...rest
      } = result;
      return { ...rest, node: { host, port, slot } };
    } catch (error) {
      this.logger.error('Failed to execute redis.cluster CLI command.', error);

      if (error instanceof CliParsingError || error instanceof CliCommandNotSupportedError) {
        this.cliAnalyticsService.sendCommandErrorEvent(clientOptions.instanceId, 'cli', error);
        return { response: error.message, status: CommandExecutionStatus.Fail };
      }

      this.cliAnalyticsService.sendConnectionErrorEvent(clientOptions.instanceId, 'cli', error);

      if (error instanceof EncryptionServiceErrorException) {
        throw error;
      }

      if (error instanceof WrongDatabaseTypeError || error instanceof ClusterNodeNotFoundError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private checkUnsupportedCommands(commandLine: string) {
    const unsupportedCommand = getUnsupportedCommands()
      .find((command) => commandLine.toLowerCase().startsWith(command));
    if (unsupportedCommand) {
      throw new CliCommandNotSupportedError(
        ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(
          unsupportedCommand.toUpperCase(),
        ),
      );
    }
  }
}
