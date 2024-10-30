import { SessionMetadata } from 'src/common/models';
import { AiMessage } from 'src/modules/ai/messages/models';
import { AiMessageRepository } from 'src/modules/ai/messages/repositories/ai.message.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { AiMessageEntity } from 'src/modules/ai/messages/entities/ai.message.entity';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { filter, isNull } from 'lodash';
import { classToClass, Config } from 'src/utils';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import config from 'src/utils/config';
import { Logger } from '@nestjs/common';
import { Nullable } from 'src/common/constants';

const aiConfig = config.get('ai') as Config['ai'];

export class LocalAiMessageRepository extends AiMessageRepository {
  private logger = new Logger('LocalAiMessageRepository');

  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(AiMessageEntity)
    private readonly repository: Repository<AiMessageEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(encryptionService, ['content', 'steps']);
  }

  /**
   * Clean history for particular database to fit N items limitation
   * @param databaseId
   * @param accountId
   */
  private async cleanupHistory(databaseId: Nullable<string>, accountId: string): Promise<void> {
    // todo: investigate why delete with sub-query doesn't works
    const idsToDelete = (await this.repository
      .createQueryBuilder()
      .where({ databaseId: databaseId ?? IsNull(), accountId })
      .select('id')
      .orderBy('createdAt', 'DESC')
      .offset(aiConfig.historyLimit)
      .getRawMany()).map((item) => item.id);

    await this.repository
      .createQueryBuilder()
      .delete()
      .whereInIds(idsToDelete)
      .execute();
  }

  async list(_sessionMetadata: SessionMetadata, databaseId: Nullable<string>, accountId: string): Promise<AiMessage[]> {
    const entities = await this.repository
      .createQueryBuilder('e')
      .where({ databaseId: databaseId ?? IsNull(), accountId })
      .orderBy('e.createdAt', 'ASC')
      .limit(aiConfig.historyLimit)
      .getMany();

    const decryptedEntities = await Promise.all(
      entities.map<Promise<AiMessageEntity>>(async (entity) => {
        try {
          return await this.modelEncryptor.decryptEntity(entity);
        } catch (e) {
          return null;
        }
      }),
    );

    return filter(decryptedEntities, (entity) => !isNull(entity))
      .map((entity) => classToClass(AiMessage, entity));
  }

  async createMany(_sessionMetadata: SessionMetadata, messages: AiMessage[]): Promise<void> {
    const entities = await Promise.all(messages.map(async (message) => {
      const entity = classToClass(AiMessageEntity, message);

      return this.modelEncryptor.encryptEntity(entity);
    }));

    await this.repository.save(entities);

    // cleanup history and ignore error if any
    try {
      await this.cleanupHistory(entities[0].databaseId, entities[0].accountId);
    } catch (e) {
      this.logger.error('Error when trying to cleanup history after insert', e);
    }
  }

  async clearHistory(
    _sessionMetadata: SessionMetadata,
    databaseId: Nullable<string>,
    accountId: string,
  ): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where({ databaseId: databaseId ?? IsNull(), accountId })
      .execute();
  }
}
