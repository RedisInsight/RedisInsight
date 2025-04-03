import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagEntity } from '../entities/tag.entity';
import { TagRepository } from './tag.repository';
import { Tag } from '../models/tag';
import { classToClass } from 'src/utils';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { EncryptionService } from 'src/modules/encryption/encryption.service';

@Injectable()
export class LocalTagRepository implements TagRepository {
  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(TagEntity)
    private readonly repository: Repository<TagEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    this.modelEncryptor = new ModelEncryptor(encryptionService, [
      'key',
      'value',
    ]);
  }

  async list(): Promise<Tag[]> {
    const entities = await this.repository.find();
    const decrypted = await this.decryptTagEntities(entities);

    return decrypted.map((entity) => classToClass(Tag, entity));
  }

  async get(id: string): Promise<Tag> {
    const entity = await this.repository.findOneBy({ id });
    const [decrypted] = await this.decryptTagEntities([entity]);

    return classToClass(Tag, decrypted);
  }

  async getByKeyValuePair(key: string, value: string): Promise<Tag> {
    const [encrypted] = await this.encryptTagEntities([
      {
        key,
        value,
      } as TagEntity,
    ]);
    const entity = await this.repository.findOneBy({
      key: encrypted.key,
      value: encrypted.value,
    });

    return classToClass(Tag, entity);
  }

  async create(tag: Tag): Promise<Tag> {
    const entity = classToClass(TagEntity, tag);
    const [encrypted] = await this.encryptTagEntities([entity]);
    const createdEntity = await this.repository.save(encrypted);

    return classToClass(Tag, createdEntity);
  }

  async update(id: string, tag: Partial<Tag>): Promise<void> {
    const entity = classToClass(TagEntity, tag);
    const [encrypted] = await this.encryptTagEntities([entity]);

    await this.repository.update(id, encrypted);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  public async encryptTagEntities(tags: TagEntity[]): Promise<TagEntity[]> {
    return Promise.all(
      tags.map(async (tag) => {
        const encrypted = await this.modelEncryptor.encryptEntity(tag);
        return {
          ...tag,
          ...encrypted,
        };
      }),
    );
  }

  public async decryptTagEntities(tags: TagEntity[]): Promise<TagEntity[]> {
    return Promise.all(
      tags.map((tag) => this.modelEncryptor.decryptEntity(tag, true)),
    );
  }

  public async getOrCreateByKeyValuePairs(
    keyValuePairs: { key: string; value: string }[],
  ): Promise<Tag[]> {
    const tags = await Promise.all(
      keyValuePairs.map(async ({ key, value }) => {
        try {
          const found = await this.getByKeyValuePair(key, value);

          if (found) {
            return found;
          }

          throw new NotFoundException(
            `Tag with key ${key} and value ${value} not found`,
          );
        } catch (error) {
          if (error instanceof NotFoundException) {
            return await this.create({ key, value } as Tag);
          }
          throw error;
        }
      }),
    );

    return tags;
  }

  async cleanupUnusedTags(): Promise<void> {
    await this.repository
      .createQueryBuilder('tag')
      .leftJoin('tag.databases', 'database')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('tag.id')
          .from('tag', 'tag')
          .leftJoin('tag.databases', 'database')
          .groupBy('tag.id')
          .having('COUNT(database.id) = 0')
          .getQuery();

        return `tag.id IN ${subQuery}`;
      })
      .delete()
      .execute();
  }
}
