import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  mockAgreements,
  mockAgreementsEntity,
  mockFeaturesConfig,
  mockFeaturesConfigData,
  mockFeaturesConfigEntity,
  mockFeaturesConfigId,
  mockFeaturesConfigJson,
  mockRepository,
  MockType,
  mockUserId
} from 'src/__mocks__';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { LocalFeaturesConfigRepository } from 'src/modules/feature/repositories/local.features-config.repository';
import { FeaturesConfigEntity } from 'src/modules/feature/entities/features-config.entity';
import { classToPlain, plainToClass } from 'class-transformer';
import { FeaturesConfigData } from 'src/modules/feature/model/features-config';
import * as defaultConfig from '../../../../config/features-config.json';

describe('LocalFeaturesConfigRepository', () => {
  let service: LocalFeaturesConfigRepository;
  let repository: MockType<Repository<FeaturesConfigEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalFeaturesConfigRepository,
        {
          provide: getRepositoryToken(FeaturesConfigEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = await module.get(getRepositoryToken(FeaturesConfigEntity));
    service = await module.get(LocalFeaturesConfigRepository);

    repository.findOneBy.mockResolvedValue(mockFeaturesConfigEntity);
    repository.update.mockResolvedValue(mockFeaturesConfigEntity);
    repository.save.mockResolvedValue(mockFeaturesConfigEntity);
  });

  describe('generateControlNumber', () => {
    const step = 10;
    const iterations = 10_000;
    const delta = 100;

    it('check controlNumber generation', async () => {
      const result = {};

      for (let i = 0; i < 100; i += step) {
        result[`${i} - ${i + step}`] = 0;
      }

      (new Array(iterations)).fill(1).forEach(() => {
        const controlNumber = service['generateControlNumber']();

        expect(controlNumber).toBeGreaterThanOrEqual(0);
        expect(controlNumber).toBeLessThan(100);

        for (let j = 0; j < 100; j += step) {
          if (controlNumber <= (j + step)) {
            result[`${j} - ${j + step}`] += 1;
            break;
          }
        }
      });

      const amountPerGroup = iterations / step;

      Object.entries(result).forEach(([, value]) => {
        expect(value).toBeGreaterThan(amountPerGroup - delta);
        expect(value).toBeLessThan(amountPerGroup + delta);
      });
    });
  });

  describe('getOrCreate', () => {
    it('should return existing config', async () => {
      const result = await service.getOrCreate();

      expect(result).toEqual(mockFeaturesConfig);
    });
    it('should update existing config with newest default', async () => {
      repository.findOneBy.mockResolvedValueOnce(plainToClass(FeaturesConfigEntity, {
        ...mockFeaturesConfig,
        data: {
          ...mockFeaturesConfigData,
          version: defaultConfig.version - 0.1,
        },
      }));

      const result = await service.getOrCreate();

      expect(result).toEqual(mockFeaturesConfig);
      expect(repository.update).toHaveBeenCalledWith(
        { id: service['id'] },
        plainToClass(FeaturesConfigEntity, { data: defaultConfig }),
      );
    });
    it('should create new config', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);

      const result = await service.getOrCreate();

      expect(result).toEqual(mockFeaturesConfig);
    });
  });
});
