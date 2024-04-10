import {
  Injectable, InternalServerErrorException, Logger, NotFoundException,
} from '@nestjs/common';
import { isUndefined } from 'lodash';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { plainToClass } from 'class-transformer';
import { classToClass } from 'src/utils';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { BrowserHistoryMode } from 'src/common/constants';
import { BrowserHistoryEntity } from '../entities/browser-history.entity';
import { BrowserHistory } from '../dto/get.browser-history.dto';
import { BrowserHistory as BrowserHistoryModel } from '../models/browser-history';
import { BrowserHistoryRepository } from '../repositories/browser-history.repository';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class BrowserHistoryProvider {
  private readonly logger = new Logger('BrowserHistoryProvider');

  private readonly encryptedFields = [
    'filter',
  ];

  constructor(
    private readonly BrowserHistoryRepository: BrowserHistoryRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Encrypt browser history and save entire entity
   * Should always throw and error in case when unable to encrypt for some reason
   * @param history
   */
  async create(sessionMetadata: SessionMetadata, history: Partial<BrowserHistory>): Promise<BrowserHistory> {
    console.log("h1-----", history);
    const encrypted = await this.encryptEntity(plainToClass(BrowserHistoryModel, history));
    console.log('e-------', encrypted);
    const model = await this.BrowserHistoryRepository.save(sessionMetadata, encrypted);

    console.log("h2-----", model);
    // cleanup history and ignore error if any
    try {
      await this.cleanupDatabaseHistory(sessionMetadata, model.databaseId, model.mode);
    } catch (e) {
      this.logger.error('Error when trying to cleanup history after insert', e);
    }

    return classToClass(BrowserHistory, await this.decryptEntity(model));
  }

  /**
   * Fetches entity, decrypt and return full BrowserHistory model
   * @param id
   */
  async get(sessionMetadata: SessionMetadata, id: string): Promise<BrowserHistory> {
    const model = await this.BrowserHistoryRepository.findById(sessionMetadata, id);

    if (!model) {
      this.logger.error(`Browser history item with id:${id} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.BROWSER_HISTORY_ITEM_NOT_FOUND);
    }

    return classToClass(BrowserHistory, await this.decryptEntity(model, true));
  }

  /**
   * Return list of browser history with several fields only
   * @param databaseId
   * @param mode
   */
  async list(sessionMetadata: SessionMetadata, databaseId: string, mode: BrowserHistoryMode): Promise<BrowserHistory[]> {
    this.logger.log('Getting browser history list');
    const models = await this.BrowserHistoryRepository.getBrowserHistory(sessionMetadata, databaseId, mode);

    this.logger.log('Succeed to get history list');

    const decryptedModels = await Promise.all(
      models.map<Promise<BrowserHistoryEntity>>(async (model) => {
        try {
          return await this.decryptEntity(model, true);
        } catch (e) {
          return null;
        }
      }),
    );

    return decryptedModels.map((model) => classToClass(BrowserHistory, model));
  }

  /**
   * Delete history item by id
   * @param databaseId
   * @param id
   */
  async delete(sessionMetadata: SessionMetadata, databaseId: string, id: string): Promise<void> {
    this.logger.log(`Deleting browser history item: ${id}`);
    try {
      await this.BrowserHistoryRepository.delete(sessionMetadata, id, databaseId);
      // todo: rethink
      this.logger.log('Succeed to delete browser history item.');
    } catch (error) {
      this.logger.error(`Failed to delete history items: ${id}`, error);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Clean history for particular database to fit 5 items limitation for each mode
   * and remove duplicates
   * @param databaseId
   */
  async cleanupDatabaseHistory(sessionMetadata: SessionMetadata, databaseId: string, mode: string): Promise<void> {
    // todo: investigate why delete with sub-query doesn't works
    await this.BrowserHistoryRepository.cleanupDatabaseHistory(sessionMetadata, databaseId, mode);
  }

  /**
   * Encrypt required browser history fields based on picked encryption strategy
   * Should always throw an encryption error to determine that something wrong
   * with encryption strategy
   *
   * @param entity
   * @private
   */
  private async encryptEntity(entity: BrowserHistoryModel): Promise<BrowserHistoryModel> {
    const encryptedEntity = {
      ...entity,
    };

    await Promise.all(this.encryptedFields.map(async (field) => {
      if (entity[field]) {
        console.log("zzzz------", field, entity[field]);
        const { data, encryption } = await this.encryptionService.encrypt(entity[field]);
        encryptedEntity[field] = data;
        encryptedEntity['encryption'] = encryption;
      }
    }));

    return encryptedEntity;
  }

  /**
   * Decrypt required filter field
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
    entity: BrowserHistoryModel,
    ignoreErrors: boolean = false,
  ): Promise<BrowserHistoryEntity> {
    return new BrowserHistoryEntity({
      ...entity,
      filter: await this.decryptField(entity, 'filter', ignoreErrors),
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
    entity: BrowserHistoryModel,
    field: string,
    ignoreErrors: boolean,
  ): Promise<string> {
    if (isUndefined(entity[field])) {
      return undefined;
    }

    try {
      return await this.encryptionService.decrypt(entity[field], entity.encryption);
    } catch (error) {
      this.logger.error(`Unable to decrypt browser history ${entity.id} fields: ${field}`, error);
      if (!ignoreErrors) {
        throw error;
      }
    }

    return null;
  }
}
