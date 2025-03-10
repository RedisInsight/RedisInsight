import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalTagRepository } from './local.tag.repository';
import { TagEntity } from '../entities/tag.entity';
import { Tag } from '../models/tag';
import { classToClass } from 'src/utils';

describe('LocalTagRepository', () => {
  let repository: LocalTagRepository;
  let tagRepository: Repository<TagEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalTagRepository,
        {
          provide: getRepositoryToken(TagEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<LocalTagRepository>(LocalTagRepository);
    tagRepository = module.get<Repository<TagEntity>>(getRepositoryToken(TagEntity));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('list', () => {
    it('should return a list of tags', async () => {
      const tagEntities = [{ id: '1', key: 'key1', value: 'value1' }, { id: '2', key: 'key2', value: 'value2' }];
      jest.spyOn(tagRepository, 'find').mockResolvedValue(tagEntities as TagEntity[]);

      const result = await repository.list();
      expect(result).toEqual(tagEntities.map(entity => classToClass(Tag, entity)));
    });
  });

  describe('get', () => {
    it('should return a tag by id', async () => {
      const tagEntity = { id: '1', key: 'key1', value: 'value1' };
      jest.spyOn(tagRepository, 'findOneBy').mockResolvedValue(tagEntity as TagEntity);

      const result = await repository.get('1');
      expect(result).toEqual(classToClass(Tag, tagEntity));
    });
  });

  describe('getByKeyValuePair', () => {
    it('should return a tag by key-value pair', async () => {
      const tagEntity = { id: '1', key: 'key1', value: 'value1' };
      jest.spyOn(tagRepository, 'findOneBy').mockResolvedValue(tagEntity as TagEntity);

      const result = await repository.getByKeyValuePair('key1', 'value1');
      expect(result).toEqual(classToClass(Tag, tagEntity));
    });
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const tag = { id: '1', key: 'key1', value: 'value1' } as Tag;
      const tagEntity = classToClass(TagEntity, tag);
      jest.spyOn(tagRepository, 'save').mockResolvedValue(tagEntity);

      const result = await repository.create(tag);
      expect(result).toEqual(classToClass(Tag, tagEntity));
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      const tag = { key: 'updatedKey', value: 'updatedValue' } as Partial<Tag>;
      const tagEntity = classToClass(TagEntity, tag);
      jest.spyOn(tagRepository, 'update').mockResolvedValue(undefined);

      await repository.update('1', tag);
      expect(tagRepository.update).toHaveBeenCalledWith('1', tagEntity);
    });
  });

  describe('delete', () => {
    it('should delete a tag', async () => {
      jest.spyOn(tagRepository, 'delete').mockResolvedValue(undefined);

      await repository.delete('1');
      expect(tagRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
