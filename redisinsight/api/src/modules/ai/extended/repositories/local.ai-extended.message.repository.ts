import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { filter, isNull } from 'lodash';
import { classToClass, Config } from 'src/utils';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import config from 'src/utils/config';
import { Logger } from '@nestjs/common';
import { AiExtendedMessageRepository } from 'src/modules/ai/extended/repositories/ai-extended.message.repository';
import { AiExtendedMessageEntity } from 'src/modules/ai/extended/entities/ai-extended.message.entity';
import { AiExtendedMessage } from 'src/modules/ai/extended/models';

const aiConfig = config.get('ai') as Config['ai'];

export class LocalAiExtendedMessageRepository extends AiExtendedMessageRepository {
  private logger = new Logger('LocalAiExtendedMessageRepository');

  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(AiExtendedMessageEntity)
    private readonly repository: Repository<AiExtendedMessageEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(encryptionService, [
      'content',
      'steps',
    ]);
  }

  /**
   * Clean history for particular database to fit N items limitation
   * @param databaseId
   * @param accountId
   */
  private async cleanupDatabaseHistory(
    databaseId: string,
    accountId: string,
  ): Promise<void> {
    // todo: investigate why delete with sub-query doesn't works
    const idsToDelete = (
      await this.repository
        .createQueryBuilder()
        .where({ databaseId, accountId })
        .select('id')
        .orderBy('createdAt', 'DESC')
        .offset(aiConfig.queryHistoryLimit)
        .getRawMany()
    ).map((item) => item.id);

    await this.repository
      .createQueryBuilder()
      .delete()
      .whereInIds(idsToDelete)
      .execute();
  }

  async list(
    databaseId: string,
    accountId?: string,
  ): Promise<AiExtendedMessage[]> {
    this.logger.debug(`list ${databaseId} ${accountId}`);
    const entities = await this.repository
      .createQueryBuilder()
      .where({ databaseId, accountId })
      .orderBy('createdAt', 'ASC')
      .limit(aiConfig.queryHistoryLimit)
      .getMany();

    const decryptedEntities = await Promise.all(
      entities.map<Promise<AiExtendedMessageEntity>>(async (entity) => {
        try {
          return await this.modelEncryptor.decryptEntity(entity);
        } catch (e) {
          return null;
        }
      }),
    );

    return filter(decryptedEntities, (entity) => !isNull(entity)).map(
      (entity) => classToClass(AiExtendedMessage, entity),
    );
  }

  async createMany(messages: AiExtendedMessage[]): Promise<void> {
    const entities = await Promise.all(
      messages.map(async (message) => {
        const entity = classToClass(AiExtendedMessageEntity, message);

        return this.modelEncryptor.encryptEntity(entity);
      }),
    );

    await this.repository.save(entities);

    // cleanup history and ignore error if any
    try {
      await this.cleanupDatabaseHistory(
        entities[0].databaseId,
        entities[0].accountId,
      );
    } catch (e) {
      this.logger.error('Error when trying to cleanup history after insert', e);
    }
  }

  async clearHistory(databaseId: string, accountId?: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where({ databaseId, accountId })
      .execute();
  }
}
