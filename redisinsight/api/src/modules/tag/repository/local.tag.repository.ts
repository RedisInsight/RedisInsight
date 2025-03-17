import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagEntity } from '../entities/tag.entity';
import { TagRepository } from './tag.repository';
import { Tag } from '../models/tag';
import { classToClass } from 'src/utils';

@Injectable()
export class LocalTagRepository implements TagRepository {
  constructor(
    @InjectRepository(TagEntity)
    private readonly repository: Repository<TagEntity>,
  ) {}

  async list(): Promise<Tag[]> {
    const entities = await this.repository.find();

    return entities.map((entity) => classToClass(Tag, entity));
  }

  async get(id: string): Promise<Tag> {
    const entity = await this.repository.findOneBy({ id });

    return classToClass(Tag, entity);
  }

  async getByKeyValuePair(key: string, value: string): Promise<Tag> {
    const entity = await this.repository.findOneBy({ key, value });

    return classToClass(Tag, entity);
  }

  async create(tag: Tag): Promise<Tag> {
    const entity = classToClass(TagEntity, tag);

    const createdEntity = await this.repository.save(entity);

    return classToClass(Tag, createdEntity);
  }

  async update(id: string, tag: Partial<Tag>): Promise<void> {
    const entity = classToClass(TagEntity, tag);

    await this.repository.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async cleanupUnusedTags(ids: string[]): Promise<void> {
    await this.repository
      .createQueryBuilder('tag')
      .leftJoin('tag.databases', 'database')
      .where('tag.id IN (:...ids)', { ids })
      .groupBy('tag.id')
      .having('COUNT(database.id) > 0')
      .delete()
      .execute();
  }
}
