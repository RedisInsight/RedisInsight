import {
  Injectable, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { classToClass } from 'src/utils';
import { FeaturesConfigRepository } from 'src/modules/feature/repositories/features-config.repository';
import { FeaturesConfigEntity } from 'src/modules/feature/entities/features-config.entity';
import { FeaturesConfig } from 'src/modules/feature/model/features-config';
import * as defaultConfig from '../../../../config/features-config.json';

@Injectable()
export class LocalFeaturesConfigRepository extends FeaturesConfigRepository {
  private readonly logger = new Logger('LocalFeaturesConfigRepository');

  private readonly id = '1';

  constructor(
    @InjectRepository(FeaturesConfigEntity)
    private readonly repository: Repository<FeaturesConfigEntity>,
  ) {
    super();
  }

  /**
   * Generate control number which should never be updated
   * @private
   */
  private generateControlNumber(): number {
    const controlNumber = Number((parseInt((Math.random() * 10_000).toString(), 10) / 100).toFixed(2));
    this.logger.log('Control number is generated', controlNumber);

    return controlNumber;
  }

  /**
   * @inheritDoc
   */
  async getOrCreate(): Promise<FeaturesConfig> {
    this.logger.log('Getting features config entity');

    let entity = await this.repository.findOneBy({ id: this.id });

    if (!entity) {
      this.logger.log('Creating features config entity');

      entity = await this.repository.save(plainToClass(FeaturesConfigEntity, {
        id: this.id,
        data: defaultConfig,
        controlNumber: this.generateControlNumber(),
      }));
    }

    return classToClass(FeaturesConfig, entity);
  }

  /**
   * @inheritDoc
   */
  async update(data: any): Promise<FeaturesConfig> {
    await this.repository.update(
      { id: this.id },
      plainToClass(FeaturesConfigEntity, { data, id: this.id }),
    );

    return this.getOrCreate();
  }
}
