import { Logger } from '@nestjs/common';
import { AiAgreementEntity } from 'src/modules/ai/agreements/entities/ai.agreement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nullable } from 'src/common/constants';
import { classToClass } from 'src/utils';
import { SessionMetadata } from 'src/common/models';
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
  public async get(_sessionMetadata: SessionMetadata, accountId: string): Promise<Nullable<AiAgreement>> {
    const entity: AiAgreementEntity = await this.repository.findOneBy({ accountId });

    if (!entity) return null;

    return classToClass(AiAgreement, entity);
  }

  /**
   * @inheritDoc
   */
  public async save(_sessionMetadata: SessionMetadata, agreement: AiAgreement): Promise<AiAgreement> {
    return await this.repository.save(classToClass(AiAgreementEntity, agreement));
  }
}
