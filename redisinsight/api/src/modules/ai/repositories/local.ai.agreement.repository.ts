import { Logger } from '@nestjs/common';
import { AiAgreementEntity } from 'src/modules/ai/entities/ai.agreement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
   * return ai agreement by DB or account id or null
   * @param databaseId
   * @param accountId
   */
  public async get(databaseId: Nullable<string>, accountId: string): Promise<Nullable<AiAgreement>> {
    const entity: AiAgreementEntity = await this.repository.findOneBy({ databaseId, accountId });

    if (!entity) return null;

    return classToClass(AiAgreement, entity);
  }

  /**
   * creates ai agreement with a given db id and account id
   * @param databaseId
   * @param accountId
   */
  public async create(databaseId: Nullable<string>, accountId: string): Promise<AiAgreement> {
    const entity: AiAgreementEntity = plainToClass(AiAgreementEntity, {
      databaseId,
      accountId,
      createdAt: new Date(),
    });

    console.log('entity!!!!!!!!!!!1', entity);

    return classToClass(AiAgreement, await this.repository.save(entity));
  }
}
