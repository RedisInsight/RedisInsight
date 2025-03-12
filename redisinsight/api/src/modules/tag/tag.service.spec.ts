import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { TagRepository } from './repository/tag.repository';
import { Tag } from './models/tag';
import { CreateTagDto, UpdateTagDto } from './dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('TagService', () => {
  let service: TagService;
  let repository: TagRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: TagRepository,
          useValue: {
            create: jest.fn(),
            list: jest.fn(),
            get: jest.fn(),
            getByKeyValuePair: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            isTagUsed: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    repository = module.get<TagRepository>(TagRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const createTagDto: CreateTagDto = { key: 'key1', value: 'value1' };
      const tag: Tag = { id: '1', ...createTagDto, createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(repository, 'create').mockResolvedValue(tag);

      const result = await service.create(createTagDto);
      expect(result).toEqual(tag);
      expect(repository.create).toHaveBeenCalledWith(expect.any(Tag));
    });

    it('should throw ConflictException if tag already exists', async () => {
      const createTagDto: CreateTagDto = { key: 'key1', value: 'value1' };
      jest.spyOn(repository, 'create').mockRejectedValue({ code: '2067' });

      await expect(service.create(createTagDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('list', () => {
    it('should return a list of tags', async () => {
      const tags: Tag[] = [{ id: '1', key: 'key1', value: 'value1', createdAt: new Date(), updatedAt: new Date() }];
      jest.spyOn(repository, 'list').mockResolvedValue(tags);

      const result = await service.list();
      expect(result).toEqual(tags);
    });
  });

  describe('get', () => {
    it('should return a tag by id', async () => {
      const tag: Tag = { id: '1', key: 'key1', value: 'value1', createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(repository, 'get').mockResolvedValue(tag);

      const result = await service.get('1');
      expect(result).toEqual(tag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      jest.spyOn(repository, 'get').mockResolvedValue(null);

      await expect(service.get('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getByKeyValuePair', () => {
    it('should return a tag by key-value pair', async () => {
      const tag: Tag = { id: '1', key: 'key1', value: 'value1', createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(repository, 'getByKeyValuePair').mockResolvedValue(tag);

      const result = await service.getByKeyValuePair('key1', 'value1');
      expect(result).toEqual(tag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      jest.spyOn(repository, 'getByKeyValuePair').mockResolvedValue(null);

      await expect(service.getByKeyValuePair('key1', 'value1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrCreateByKeyValuePairs', () => {
    it('should return existing tags or create new ones', async () => {
      const createTagDto: CreateTagDto = { key: 'key1', value: 'value1' };
      const tag: Tag = { id: '1', ...createTagDto, createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(service, 'getByKeyValuePair').mockResolvedValueOnce(tag);
      jest.spyOn(service, 'create').mockResolvedValueOnce(tag);

      const result = await service.getOrCreateByKeyValuePairs([createTagDto]);
      expect(result).toEqual([tag]);
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      const updateTagDto: UpdateTagDto = { key: 'updatedKey', value: 'updatedValue' };
      const tag: Tag = { id: '1', ...updateTagDto, createdAt: new Date(), updatedAt: new Date(), databases: [] } as Tag;
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(repository, 'get').mockResolvedValue(tag);

      const result = await service.update('1', updateTagDto);
      expect(result).toEqual(tag);
      expect(repository.update).toHaveBeenCalledWith('1', updateTagDto);
    });
  });

  describe('delete', () => {
    it('should delete a tag', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

      await service.delete('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('isTagUsed', () => {
    it('should return true if tag is used', async () => {
      jest.spyOn(repository, 'isTagUsed').mockResolvedValue(true);

      const result = await service.isTagUsed('1');
      expect(result).toBe(true);
    });

    it('should return false if tag is not used', async () => {
      jest.spyOn(repository, 'isTagUsed').mockResolvedValue(false);

      const result = await service.isTagUsed('1');
      expect(result).toBe(false);
    });
  });
});
