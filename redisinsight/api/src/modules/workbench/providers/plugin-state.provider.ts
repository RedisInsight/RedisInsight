import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUndefined } from 'lodash';
import { plainToClass } from 'class-transformer';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { classToClass } from 'src/utils';
import { PluginStateEntity } from 'src/modules/workbench/entities/plugin-state.entity';
import { PluginState } from 'src/modules/workbench/models/plugin-state';

@Injectable()
export class PluginStateProvider {
  private logger = new Logger('PluginStateProvider');

  constructor(
    @InjectRepository(PluginStateEntity)
    private readonly repository: Repository<PluginStateEntity>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Encrypt command execution and save entire entity
   * Should always throw and error in case when unable to encrypt for some reason
   * @param pluginState
   */
  async upsert(pluginState: Partial<PluginState>): Promise<void> {
    const entity = plainToClass(PluginStateEntity, pluginState);
    await this.repository.save(await this.encryptEntity(entity));
  }

  /**
   * Get single command execution entity, decrypt and convert to model
   *
   * @param visualizationId
   * @param commandExecutionId
   */
  async getOne(visualizationId: string, commandExecutionId: string): Promise<PluginState> {
    this.logger.log('Getting plugin state');

    const entity = await this.repository.findOne({ visualizationId, commandExecutionId });

    if (!entity) {
      this.logger.error(`Plugin state ${commandExecutionId}:${visualizationId} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.PLUGIN_STATE_NOT_FOUND);
    }

    this.logger.log(`Succeed to get plugin state ${commandExecutionId}:${visualizationId}`);

    const decryptedEntity = await this.decryptEntity(entity, true);

    return classToClass(PluginState, decryptedEntity);
  }

  /**
   * Encrypt required command execution fields based on picked encryption strategy
   * Should always throw an encryption error to determine that something wrong
   * with encryption strategy
   *
   * @param entity
   * @private
   */
  private async encryptEntity(entity: PluginStateEntity): Promise<PluginStateEntity> {
    let state = null;
    let encryption = null;

    if (entity.state) {
      const encryptionResult = await this.encryptionService.encrypt(entity.state);
      state = encryptionResult.data;
      encryption = encryptionResult.encryption;
    }

    return {
      ...entity,
      state,
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
    entity: PluginStateEntity,
    ignoreErrors: boolean = false,
  ): Promise<PluginStateEntity> {
    return new PluginStateEntity({
      ...entity,
      state: await this.decryptField(entity, 'state', ignoreErrors),
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
    entity: PluginStateEntity,
    field: string,
    ignoreErrors: boolean,
  ): Promise<string> {
    if (isUndefined(entity[field])) {
      return undefined;
    }

    try {
      return await this.encryptionService.decrypt(entity[field], entity.encryption);
    } catch (error) {
      this.logger.error(
        `Unable to decrypt state ${entity.commandExecutionId}:${entity.visualizationId} fields: ${field}`,
        error,
      );

      if (!ignoreErrors) {
        throw error;
      }
    }

    return null;
  }
}
