import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nullable } from 'src/common/constants';
import { classToClass } from 'src/utils';
import { SessionMetadata } from 'src/common/models';
import { AiDatabaseAgreementRepository } from './ai.database.agreement.repository';
import { AiDatabaseAgreementEntity } from '../entities/ai.database.agreement.entity';
import { AiDatabaseAgreement } from '../models/ai.database.agreement';

export class LocalAiDatabaseAgreementRepository extends AiDatabaseAgreementRepository {
  private logger = new Logger('LocalAiAgreementRepository');

  constructor(
    @InjectRepository(AiDatabaseAgreementEntity)
    private readonly repository: Repository<AiDatabaseAgreementEntity>,
  ) {
    super();
  }

  /**
   * @inheritDoc
   */
  public async get(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId: string,
  ): Promise<Nullable<AiDatabaseAgreement>> {
    const entity: AiDatabaseAgreementEntity = await this.repository.findOneBy({ databaseId, accountId });

    if (!entity) return null;

    return classToClass(AiDatabaseAgreement, entity);
  }

  /**
   * @inheritDoc
   */
  public async save(_sessionMetadata: SessionMetadata, agreement: AiDatabaseAgreement): Promise<AiDatabaseAgreement> {
    return await this.repository.save(classToClass(AiDatabaseAgreementEntity, agreement));
  }
}
