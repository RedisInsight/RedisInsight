import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUndefined, filter, isNull } from 'lodash';
import { plainToClass } from 'class-transformer';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';
import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { classToClass } from 'src/utils';
import { ShortCommandExecution } from 'src/modules/workbench/models/short-command-execution';

@Injectable()
export class CommandExecutionProvider {
  private logger = new Logger('CommandExecutionProvider');

  constructor(
    @InjectRepository(CommandExecutionEntity)
    private readonly commandExecutionRepository: Repository<CommandExecutionEntity>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Encrypt command execution and save entire entity
   * Should always throw and error in case when unable to encrypt for some reason
   * @param commandExecution
   */
  async create(commandExecution: Partial<CommandExecution>): Promise<CommandExecution> {
    const entity = plainToClass(CommandExecutionEntity, commandExecution);

    return classToClass(
      CommandExecution,
      await this.decryptEntity(
        await this.commandExecutionRepository.save(await this.encryptEntity(entity)),
        true,
      ),
    );
  }

  /**
   * @param databaseId
   */
  async getList(databaseId: string): Promise<ShortCommandExecution[]> {
    this.logger.log('Getting command executions');
    const entities = await this.commandExecutionRepository
      .createQueryBuilder('e')
      .where({ databaseId })
      .select(['e.id', 'e.command', 'e.databaseId', 'e.createdAt', 'e.encryption', 'e.role', 'e.nodeOptions'])
      .orderBy('e.createdAt', 'DESC')
      .limit(30)
      .getMany();

    this.logger.log('Succeed to get command executions');

    const decryptedEntities = await Promise.all(
      entities.map<Promise<CommandExecutionEntity>>(async (entity) => {
        try {
          return await this.decryptEntity(entity);
        } catch (e) {
          return null;
        }
      }),
    );

    return filter(decryptedEntities, (entity) => !isNull(entity))
      .map((entity) => classToClass(ShortCommandExecution, entity));
  }

  /**
   * Get single command execution entity, decrypt and convert to model
   *
   * @param databaseId
   * @param id
   */
  async getOne(databaseId: string, id: string): Promise<CommandExecution> {
    this.logger.log('Getting command executions');

    const entity = await this.commandExecutionRepository.findOne({ id, databaseId });

    if (!entity) {
      this.logger.error(`Command execution with id:${id} and databaseId:${databaseId} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.COMMAND_EXECUTION_NOT_FOUND);
    }

    this.logger.log(`Succeed to get command execution ${id}`);

    const decryptedEntity = await this.decryptEntity(entity, true);

    return classToClass(CommandExecution, decryptedEntity);
  }

  /**
   * Encrypt required command execution fields based on picked encryption strategy
   * Should always throw an encryption error to determine that something wrong
   * with encryption strategy
   *
   * @param entity
   * @private
   */
  private async encryptEntity(entity: CommandExecutionEntity): Promise<CommandExecutionEntity> {
    let command = null;
    let result = null;
    let encryption = null;

    if (entity.command) {
      const encryptionResult = await this.encryptionService.encrypt(entity.command);
      command = encryptionResult.data;
      encryption = encryptionResult.encryption;
    }

    if (entity.result) {
      const encryptionResult = await this.encryptionService.encrypt(entity.result);
      result = encryptionResult.data;
      encryption = encryptionResult.encryption;
    }

    return {
      ...entity,
      command,
      result,
      encryption,
    };
  }

  /**
   * Decrypt required command execution fields
   * This method should optionally not fail (to not block users to navigate across app
   * on decryption error, for example, to be able change encryption strategy in the future)
   *
   * When ignoreErrors = true will return null for failed fields.
   * It will cause 401 Unauthorized errors when user tries to connect to redis database
   *
   * @param entity
   * @param ignoreErrors
   * @private
   */
  private async decryptEntity(
    entity: CommandExecutionEntity,
    ignoreErrors: boolean = false,
  ): Promise<CommandExecutionEntity> {
    return new CommandExecutionEntity({
      ...entity,
      command: await this.decryptField(entity, 'command', ignoreErrors),
      result: await this.decryptField(entity, 'result', ignoreErrors),
    });
  }

  /**
   * Decrypt single field if exists
   *
   * @param entity
   * @param field
   * @param ignoreErrors
   * @private
   */
  private async decryptField(
    entity: CommandExecutionEntity,
    field: string,
    ignoreErrors: boolean,
  ): Promise<string> {
    if (isUndefined(entity[field])) {
      return undefined;
    }

    try {
      return await this.encryptionService.decrypt(entity[field], entity.encryption);
    } catch (error) {
      this.logger.error(`Unable to decrypt command execution ${entity.id} fields: ${field}`, error);
      if (!ignoreErrors) {
        throw error;
      }
    }

    return null;
  }
}
