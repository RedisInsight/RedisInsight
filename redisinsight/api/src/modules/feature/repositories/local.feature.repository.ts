import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { classToClass } from 'src/utils';

import { FeatureRepository } from './feature.repository';
import { FeatureEntity } from '../entities/feature.entity';
import { Feature } from '../model/feature';

@Injectable()
export class LocalFeatureRepository extends FeatureRepository {
  constructor(
    @InjectRepository(FeatureEntity)
    private readonly repository: Repository<FeatureEntity>,
  ) {
    super();
  }

  /**
   * @inheritDoc
   */
  async get(name: string): Promise<Feature> {
    const entity = await this.repository.findOneBy({ name });
    return classToClass(Feature, entity);
  }

  /**
   * @inheritDoc
   */
  async list(): Promise<Feature[]> {
    return (await this.repository.find()).map((entity) => classToClass(Feature, entity));
  }

  /**
   * @inheritDoc
   */
  async upsert(feature: Feature): Promise<Feature> {
    await this.repository.upsert(feature, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['name'],
    });

    return this.get(feature.name);
  }

  /**
   * @inheritDoc
   */
  async delete(name: string): Promise<void> {
    await this.repository.delete({ name });
  }
}
