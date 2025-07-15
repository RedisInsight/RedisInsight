import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { filter, isNull } from 'lodash';
import { classToClass, Config } from 'src/utils';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import config from 'src/utils/config';
import { Logger } from '@nestjs/common';
import { AiDataGeneratorMessageRepository } from 'src/modules/ai/data-generator/repositories/ai-data-generator.message.repository';
import { AiDataGeneratorMessageEntity } from 'src/modules/ai/data-generator/entities/ai-data-generator.message.entity';
import { AiDataGeneratorMessage } from 'src/modules/ai/data-generator/models';

const aiConfig = config.get('ai') as Config['ai'];

export class LocalAiDataGeneratorMessageRepository extends AiDataGeneratorMessageRepository {
  private logger = new Logger('LocalAiDataGeneratorMessageRepository');

  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(AiDataGeneratorMessageEntity)
    private readonly repository: Repository<AiDataGeneratorMessageEntity>,
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
   */
  private async cleanupDatabaseHistory(
    databaseId: string,
  ): Promise<void> {
    // todo: investigate why delete with sub-query doesn't works
    const idsToDelete = (
      await this.repository
        .createQueryBuilder()
        .where({ databaseId })
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

  async list(databaseId: string): Promise<AiDataGeneratorMessage[]> {
    this.logger.debug(`list ${databaseId}`);
    const entities = await this.repository
      .createQueryBuilder()
      .where({ databaseId })
      .orderBy('createdAt', 'ASC')
      .limit(aiConfig.queryHistoryLimit)
      .getMany();

    const decryptedEntities = await Promise.all(
      entities.map<Promise<AiDataGeneratorMessageEntity>>(async (entity) => {
        try {
          return await this.modelEncryptor.decryptEntity(entity);
        } catch (e) {
          return null;
        }
      }),
    );

    return filter(decryptedEntities, (entity) => !isNull(entity)).map(
      (entity) => classToClass(AiDataGeneratorMessage, entity),
    );
  }

  async createMany(messages: AiDataGeneratorMessage[]): Promise<void> {
    const entities = await Promise.all(
      messages.map(async (message) => {
        const entity = classToClass(AiDataGeneratorMessageEntity, message);

        return this.modelEncryptor.encryptEntity(entity);
      }),
    );

    await this.repository.save(entities);

    // cleanup history and ignore error if any
    try {
      await this.cleanupDatabaseHistory(entities[0].databaseId);
    } catch (e) {
      this.logger.error('Error when trying to cleanup history after insert', e);
    }
  }

  async clearHistory(databaseId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where({ databaseId })
      .execute();
  }
}
