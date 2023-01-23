import {
  Injectable, InternalServerErrorException, Logger, NotFoundException,
} from '@nestjs/common';
import { isUndefined } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { plainToClass } from 'class-transformer';
import { classToClass } from 'src/utils';
import config from 'src/utils/config';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { BrowserHistoryMode } from 'src/common/constants';
import { BrowserHistoryEntity } from '../../entities/browser-history.entity';
import { BrowserHistory } from '../../dto/browser-history/get.browser-history.dto';

const BROWSER_HISTORY_CONFIG = config.get('browser_history');

@Injectable()
export class BrowserHistoryProvider {
  private readonly logger = new Logger('BrowserHistoryProvider');

  private readonly encryptedFields = [
    'filter',
  ];

  constructor(
    @InjectRepository(BrowserHistoryEntity)
    private readonly repository: Repository<BrowserHistoryEntity>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Encrypt browser history and save entire entity
   * Should always throw and error in case when unable to encrypt for some reason
   * @param history
   */
  async create(history: Partial<BrowserHistory>): Promise<BrowserHistory> {
    const entity = await this.repository.save(await this.encryptEntity(plainToClass(BrowserHistoryEntity, history)));

    // cleanup history and ignore error if any
    try {
      await this.cleanupDatabaseHistory(entity.databaseId, entity.mode);
    } catch (e) {
      this.logger.error('Error when trying to cleanup history after insert', e);
    }

    return classToClass(BrowserHistory, await this.decryptEntity(entity));
  }

  /**
   * Fetches entity, decrypt and return full BrowserHistory model
   * @param id
   */
  async get(id: string): Promise<BrowserHistory> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      this.logger.error(`Browser history item with id:${id} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.BROWSER_HISTORY_ITEM_NOT_FOUND);
    }

    return classToClass(BrowserHistory, await this.decryptEntity(entity, true));
  }

  /**
   * Return list of browser history with several fields only
   * @param databaseId
   * @param mode
   */
  async list(databaseId: string, mode: BrowserHistoryMode): Promise<BrowserHistory[]> {
    this.logger.log('Getting browser history list');
    const entities = await this.repository
      .createQueryBuilder('a')
      .where({ databaseId, mode })
      .select([
        'a.id',
        'a.filter',
      ])
      .orderBy('a.createdAt', 'DESC')
      .limit(BROWSER_HISTORY_CONFIG.maxItemsPerModeInDb)
      .getMany();

    this.logger.log('Succeed to get history list');

    return entities.map((entity) => classToClass(BrowserHistory, entity));
  }

  /**
   * Delete database instance by id
   * Also close all opened connections for this database
   * Also emit an event to entire app to be processed by other parts
   * @param id
   */
  async delete(databaseId: string, id: string): Promise<void> {
    this.logger.log(`Deleting browser history item: ${id}`);
    try {
      await this.repository.delete({id, databaseId});
      // todo: rethink
      this.logger.log('Succeed to delete browser history item.');
    } catch (error) {
      this.logger.error(`Failed to delete history items: ${id}`, error);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Clean history for particular database to fit 30 items limitation
   * @param databaseId
   */
  async cleanupDatabaseHistory(databaseId: string, mode: string): Promise<void> {
    // todo: investigate why delete with sub-query doesn't works
    const idsToDelete = (await this.repository
      .createQueryBuilder()
      .where({ databaseId, mode })
      .select('id')
      .orderBy('createdAt', 'DESC')
      .offset(BROWSER_HISTORY_CONFIG.maxItemsPerModeInDb)
      .getRawMany()).map((item) => item.id);

    await this.repository
      .createQueryBuilder()
      .delete()
      .whereInIds(idsToDelete)
      .execute();
  }

  /**
   * Encrypt required browser history fields based on picked encryption strategy
   * Should always throw an encryption error to determine that something wrong
   * with encryption strategy
   *
   * @param entity
   * @private
   */
  private async encryptEntity(entity: BrowserHistoryEntity): Promise<BrowserHistoryEntity> {
    const encryptedEntity = {
      ...entity,
    };

    await Promise.all(this.encryptedFields.map(async (field) => {
      if (entity[field]) {
        const { data, encryption } = await this.encryptionService.encrypt(entity[field]);
        encryptedEntity[field] = data;
        encryptedEntity['encryption'] = encryption;
      }
    }));

    return encryptedEntity;
  }

  /**
   * Decrypt required browser history fields
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
    entity: BrowserHistoryEntity,
    ignoreErrors: boolean = false,
  ): Promise<BrowserHistoryEntity> {
    const decrypted = {
      ...entity,
    };

    await Promise.all(this.encryptedFields.map(async (field) => {
      decrypted[field] = await this.decryptField(entity, field, ignoreErrors);
    }));

    return new BrowserHistoryEntity({
      ...decrypted,
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
    entity: BrowserHistoryEntity,
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
