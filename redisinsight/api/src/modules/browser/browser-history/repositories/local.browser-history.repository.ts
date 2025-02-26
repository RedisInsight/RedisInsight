import {
  Injectable, InternalServerErrorException, Logger, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { plainToClass } from 'class-transformer';
import { classToClass } from 'src/utils';
import config from 'src/utils/config';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { BrowserHistoryMode } from 'src/common/constants';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { SessionMetadata } from 'src/common/models';
import { BrowserHistoryEntity } from '../entities/browser-history.entity';
import { BrowserHistoryRepository } from './browser-history.repository';
import { BrowserHistory } from '../dto';

const BROWSER_HISTORY_CONFIG = config.get('browser_history');

@Injectable()
export class LocalBrowserHistoryRepository extends BrowserHistoryRepository {
  private readonly logger = new Logger('BrowserHistoryRepository');

  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(BrowserHistoryEntity)
    private readonly repository: Repository<BrowserHistoryEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(encryptionService, ['filter']);
  }

  /**
   * Encrypt browser history and save entire entity
   * Should always throw and error in case when unable to encrypt for some reason
   * @param sessionMetadata
   * @param history
   */
  async create(sessionMetadata: SessionMetadata, history: Partial<BrowserHistory>): Promise<BrowserHistory> {
    const encryptedDto = await this.modelEncryptor.encryptEntity(plainToClass(BrowserHistoryEntity, history));
    const entity = await this.repository.save(encryptedDto);

    // cleanup history and ignore error if any
    try {
      await this.cleanupDatabaseHistory(sessionMetadata, entity.databaseId, entity.mode);
    } catch (e) {
      this.logger.error('Error when trying to cleanup history after insert', e, sessionMetadata);
    }

    return classToClass(BrowserHistory, await this.modelEncryptor.decryptEntity(entity));
  }

  /**
   * Fetches entity, decrypt and return full BrowserHistory model
   * @param sessionMetadata
   * @param id
   */
  async get(sessionMetadata: SessionMetadata, id: string): Promise<BrowserHistory> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      this.logger.error(`Browser history item with id:${id} was not Found`, sessionMetadata);
      throw new NotFoundException(ERROR_MESSAGES.BROWSER_HISTORY_ITEM_NOT_FOUND);
    }

    return classToClass(BrowserHistory, await this.modelEncryptor.decryptEntity(entity, true));
  }

  /**
   * Return list of browser history with several fields only
   * @param sessionMetadata
   * @param databaseId
   * @param mode
   */
  async list(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    mode: BrowserHistoryMode,
  ): Promise<BrowserHistory[]> {
    this.logger.debug('Getting browser history list', sessionMetadata);
    const entities = await this.repository
      .createQueryBuilder('a')
      .where({ databaseId, mode })
      .select([
        'a.id',
        'a.filter',
        'a.mode',
        'a.encryption',
      ])
      .orderBy('a.createdAt', 'DESC')
      .limit(BROWSER_HISTORY_CONFIG.maxItemsPerModeInDb)
      .getMany();

    this.logger.debug('Succeed to get history list', sessionMetadata);

    const decryptedEntities = await Promise.all(
      entities.map<Promise<BrowserHistoryEntity>>(async (entity) => {
        try {
          return await this.modelEncryptor.decryptEntity(entity, true);
        } catch (e) {
          return null;
        }
      }),
    );

    return decryptedEntities.map((entity) => classToClass(BrowserHistory, entity));
  }

  /**
   * Delete history item by id
   * @param sessionMetadata
   * @param databaseId
   * @param mode
   * @param id
   */
  async delete(sessionMetadata: SessionMetadata, databaseId: string, mode: BrowserHistoryMode, id: string): Promise<void> {
    this.logger.debug(`Deleting browser history item: ${id}`, sessionMetadata);
    try {
      await this.repository.delete({ id, databaseId, mode });
      // todo: rethink
      this.logger.debug('Succeed to delete browser history item.', sessionMetadata);
    } catch (error) {
      this.logger.error(`Failed to delete history items: ${id}`, error, sessionMetadata);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Clean history for particular database to fit 5 items limitation for each mode
   * and remove duplicates
   * @param _sessionMetadata
   * @param databaseId
   * @param mode
   */
  async cleanupDatabaseHistory(_sessionMetadata: SessionMetadata, databaseId: string, mode: string): Promise<void> {
    // todo: investigate why delete with sub-query doesn't works
    const idsDuplicates = (await this.repository
      .createQueryBuilder()
      .where({ databaseId, mode })
      .select('id')
      .groupBy('filter')
      .having('COUNT(filter) > 1')
      .getRawMany()).map((item) => item.id);

    const idsOverLimit = (await this.repository
      .createQueryBuilder()
      .where({ databaseId, mode })
      .select('id')
      .orderBy('createdAt', 'DESC')
      .offset(BROWSER_HISTORY_CONFIG.maxItemsPerModeInDb + idsDuplicates.length)
      .getRawMany()).map((item) => item.id);

    await this.repository
      .createQueryBuilder()
      .delete()
      .whereInIds([...idsOverLimit, ...idsDuplicates])
      .execute();
  }
}
