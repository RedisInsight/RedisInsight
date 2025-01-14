import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { classToClass } from 'src/utils';
import { AgreementsRepository } from 'src/modules/settings/repositories/agreements.repository';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { Agreements } from 'src/modules/settings/models/agreements';
import { SessionMetadata } from 'src/common/models';

export class LocalAgreementsRepository extends AgreementsRepository {
  constructor(
    @InjectRepository(AgreementsEntity)
    private readonly repository: Repository<AgreementsEntity>,
  ) {
    super();
  }

  async getOrCreate(): Promise<Agreements> {
    let entity = await this.repository.findOneBy({});

    if (!entity) {
      try {
        entity = await this.repository.save(this.repository.create({ id: 1 }));
      } catch (e) {
        if (e.code === 'SQLITE_CONSTRAINT') {
          return this.getOrCreate();
        }

        throw e;
      }
    }

    return classToClass(Agreements, entity);
  }

  async update(
    _: SessionMetadata,
    agreements: Agreements,
  ): Promise<Agreements> {
    const entity = classToClass(AgreementsEntity, agreements);

    await this.repository.save(entity);

    return this.getOrCreate();
  }
}
