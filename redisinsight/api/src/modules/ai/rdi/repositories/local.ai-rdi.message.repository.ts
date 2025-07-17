import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { filter, isNull } from 'lodash';
import { classToClass, Config } from 'src/utils';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import config from 'src/utils/config';
import { Logger } from '@nestjs/common';
import { AiRdiMessageRepository } from 'src/modules/ai/rdi/repositories/ai-rdi.message.repository';
import { AiRdiMessageEntity } from 'src/modules/ai/rdi/entities/ai-rdi.message.entity';
import { AiRdiMessage } from 'src/modules/ai/rdi/models';

const aiConfig = config.get('ai') as Config['ai'];

export class LocalAiRdiMessageRepository extends AiRdiMessageRepository {
  private logger = new Logger('LocalAiRdiMessageRepository');

  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(AiRdiMessageEntity)
    private readonly repository: Repository<AiRdiMessageEntity>,
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
   * @param targetId
   * @param accountId
   */
  private async cleanupDatabaseHistory(
    targetId: string,
    accountId: string,
  ): Promise<void> {
    // todo: investigate why delete with sub-query doesn't works
    const idsToDelete = (
      await this.repository
        .createQueryBuilder()
        .where({ targetId, accountId })
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

  async list(targetId: string): Promise<AiRdiMessage[]> {
    const entities = await this.repository
      .createQueryBuilder()
      .where({ targetId })
      .orderBy('createdAt', 'ASC')
      .limit(aiConfig.queryHistoryLimit)
      .getMany();

    const decryptedEntities = await Promise.all(
      entities.map<Promise<AiRdiMessageEntity>>(async (entity) => {
        try {
          return await this.modelEncryptor.decryptEntity(entity);
        } catch (e) {
          return null;
        }
      }),
    );

    return filter(decryptedEntities, (entity) => !isNull(entity)).map(
      (entity) => classToClass(AiRdiMessage, entity),
    );
  }

  async createMany(messages: AiRdiMessage[]): Promise<void> {
    const entities = await Promise.all(
      messages.map(async (message) => {
        const entity = classToClass(AiRdiMessageEntity, message);

        return this.modelEncryptor.encryptEntity(entity);
      }),
    );

    await this.repository.save(entities);

    // cleanup history and ignore error if any
    try {
      await this.cleanupDatabaseHistory(
        entities[0].targetId,
        entities[0].accountId,
      );
    } catch (e) {
      this.logger.error('Error when trying to cleanup history after insert', e);
    }
  }

  async clearHistory(targetId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where({ targetId })
      .execute();
  }
}
