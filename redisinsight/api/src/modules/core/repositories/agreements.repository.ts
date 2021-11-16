import { EntityRepository, Repository } from 'typeorm';
import { AgreementsEntity } from 'src/modules/core/models/agreements.entity';

@EntityRepository(AgreementsEntity)
export class AgreementsRepository extends Repository<AgreementsEntity> {}
