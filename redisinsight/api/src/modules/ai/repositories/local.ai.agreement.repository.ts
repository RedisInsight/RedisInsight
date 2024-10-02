import { Logger } from '@nestjs/common';
import { AiAgreementEntity } from 'src/modules/ai/entities/ai.agreement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Nullable } from 'src/common/constants';
import { plainToClass } from 'class-transformer';
import { classToClass } from 'src/utils';
import { AiAgreementRepository } from './ai.agreement.repository';
import { AiAgreement } from '../models/ai.agreement';

export class LocalAiAgreementRepository extends AiAgreementRepository {
  private logger = new Logger('LocalAiAgreementRepository');

  constructor(
    @InjectRepository(AiAgreementEntity)
    private readonly repository: Repository<AiAgreementEntity>,
  ) {
    super();
  }

  /**
   * @inheritDoc
   */
  public async list(accountId: string): Promise<AiAgreement[]> {
    const entities = await this.repository
      .createQueryBuilder('e')
      .where({ accountId })
      .getMany();

    return entities.map((entity) => classToClass(AiAgreement, entity));
  }

  /**
   * @inheritDoc
   */
  public async get(databaseId: Nullable<string>, accountId: string): Promise<Nullable<AiAgreement>> {
    const entity: AiAgreementEntity = await this.repository.findOneBy({ databaseId, accountId });

    if (!entity) return null;

    return classToClass(AiAgreement, entity);
  }

  /**
   * @inheritDoc
   */
  public async create(databaseId: Nullable<string>, accountId: string): Promise<AiAgreement> {
    const entity: AiAgreementEntity = plainToClass(AiAgreementEntity, {
      databaseId,
      accountId,
      createdAt: new Date(),
    });

    return classToClass(AiAgreement, await this.repository.save(entity));
  }

  /**
   * @inheritDoc
   */
  public async delete(databaseId: Nullable<string>, accountId: string): Promise<void> {
    await this.repository
      .createQueryBuilder('a')
      .delete()
      .where({ databaseId: databaseId ?? IsNull(), accountId })
      .execute();
  }
}
