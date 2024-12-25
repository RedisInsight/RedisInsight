import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { filter, isNull } from 'lodash';
import { plainToClass } from 'class-transformer';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';
import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { classToClass } from 'src/utils';
import { ShortCommandExecution } from 'src/modules/workbench/models/short-command-execution';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { CommandExecutionRepository } from 'src/modules/workbench/repositories/command-execution.repository';
import config from 'src/utils/config';
import { SessionMetadata } from 'src/common/models';
import { CommandExecutionFilter } from 'src/modules/workbench/models/command-executions.filter';

const WORKBENCH_CONFIG = config.get('workbench');

@Injectable()
export class LocalCommandExecutionRepository extends CommandExecutionRepository {
  private logger = new Logger('LocalCommandExecutionRepository');

  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(CommandExecutionEntity)
    private readonly commandExecutionRepository: Repository<CommandExecutionEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(this.encryptionService, ['command', 'result']);
  }

  /**
   * @inheritDoc
   * ___
   * Should encrypt command executions
   * Should always throw and error in case when unable to encrypt for some reason
   */
  async createMany(_: SessionMetadata, commandExecutions: Partial<CommandExecution>[]): Promise<CommandExecution[]> {
    // todo: limit by 30 max to insert
    const response = await Promise.all(commandExecutions.map(async (commandExecution, idx) => {
      const entity = plainToClass(CommandExecutionEntity, commandExecution);
      let isNotStored: undefined | boolean;

      // Do not store command execution result that exceeded limitation
      if (JSON.stringify(entity.result).length > WORKBENCH_CONFIG.maxResultSize) {
        entity.result = JSON.stringify([
          {
            status: CommandExecutionStatus.Success,
            response: ERROR_MESSAGES.WORKBENCH_RESPONSE_TOO_BIG(),
          },
        ]);
        // Hack, do not store isNotStored. Send once to show warning
        isNotStored = true;
      }

      return classToClass(CommandExecution, {
        ...(await this.commandExecutionRepository.save(await this.modelEncryptor.encryptEntity(entity))),
        command: commandExecutions[idx].command, // avoid decryption
        mode: commandExecutions[idx].mode,
        result: commandExecutions[idx].result, // avoid decryption + show original response when it was huge
        summary: commandExecutions[idx].summary,
        executionTime: commandExecutions[idx].executionTime,
        isNotStored,
      });
    }));

    // cleanup history and ignore error if any
    try {
      await this.cleanupDatabaseHistory(response[0].databaseId, { type: commandExecutions[0].type });
    } catch (e) {
      this.logger.error('Error when trying to cleanup history after insert', e);
    }

    return response;
  }

  /**
   * @inheritDoc
   */
  async getList(
    _: SessionMetadata,
    databaseId: string,
    queryFilter: CommandExecutionFilter,
  ): Promise<ShortCommandExecution[]> {
    this.logger.log('Getting command executions');
    const entities = await this.commandExecutionRepository
      .createQueryBuilder('e')
      .where({ databaseId, type: queryFilter.type })
      .select([
        'e.id',
        'e.command',
        'e.databaseId',
        'e.createdAt',
        'e.encryption',
        'e.mode',
        'e.summary',
        'e.resultsMode',
        'e.executionTime',
        'e.db',
        'e.type',
      ])
      .orderBy('e.createdAt', 'DESC')
      .limit(WORKBENCH_CONFIG.maxItemsPerDb)
      .getMany();

    this.logger.log('Succeed to get command executions');

    const decryptedEntities = await Promise.all(
      entities.map<Promise<CommandExecutionEntity>>(async (entity) => {
        try {
          return await this.modelEncryptor.decryptEntity(entity);
        } catch (e) {
          return null;
        }
      }),
    );

    return filter(decryptedEntities, (entity) => !isNull(entity))
      .map((entity) => classToClass(ShortCommandExecution, entity));
  }

  /**
   * @inheritDoc
   */
  async getOne(_: SessionMetadata, databaseId: string, id: string): Promise<CommandExecution> {
    this.logger.log('Getting command executions');

    const entity = await this.commandExecutionRepository.findOneBy({ id, databaseId });

    if (!entity) {
      this.logger.error(`Command execution with id:${id} and databaseId:${databaseId} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.COMMAND_EXECUTION_NOT_FOUND);
    }

    this.logger.log(`Succeed to get command execution ${id}`);

    const decryptedEntity = await this.modelEncryptor.decryptEntity(entity, true);

    return classToClass(CommandExecution, decryptedEntity);
  }

  /**
   * @inheritDoc
   */
  async delete(_: SessionMetadata, databaseId: string, id: string): Promise<void> {
    this.logger.log('Delete command execution');

    await this.commandExecutionRepository.delete({ id, databaseId });

    this.logger.log('Command execution deleted');
  }

  /**
   * @inheritDoc
   */
  async deleteAll(_: SessionMetadata, databaseId: string, queryFilter: CommandExecutionFilter): Promise<void> {
    this.logger.log('Delete all command executions');

    await this.commandExecutionRepository.delete({ databaseId, type: queryFilter.type });

    this.logger.log('Command executions deleted');
  }

  /**
   * Clean history for particular database to fit N items limitation
   * @param databaseId
   * @param queryFilter
   */
  private async cleanupDatabaseHistory(databaseId: string, queryFilter: CommandExecutionFilter): Promise<void> {
    // todo: investigate why delete with sub-query doesn't works
    const idsToDelete = (await this.commandExecutionRepository
      .createQueryBuilder()
      .where({ databaseId, type: queryFilter.type })
      .select('id')
      .orderBy('createdAt', 'DESC')
      .offset(WORKBENCH_CONFIG.maxItemsPerDb)
      .getRawMany()).map((item) => item.id);

    await this.commandExecutionRepository
      .createQueryBuilder()
      .delete()
      .whereInIds(idsToDelete)
      .execute();
  }
}
