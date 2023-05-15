import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  mockAgreements,
  mockAgreementsEntity, mockFeaturesConfig, mockFeaturesConfigEntity, mockFeaturesConfigId,
  mockRepository,
  MockType, mockUserId
} from 'src/__mocks__';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { LocalFeaturesConfigRepository } from 'src/modules/feature/repositories/local.features-config.repository';
import { FeaturesConfigEntity } from 'src/modules/feature/entities/features-config.entity';

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
    repository.update.mockResolvedValue(true); // no meter of response
    repository.save.mockResolvedValue(mockFeaturesConfigEntity);
  });

  describe('getOrCreate', () => {
    it('ttt', async () => {
      console.log('___ m entity', require('util').inspect(mockFeaturesConfigEntity, { depth: null }))
      console.log('___ m model', require('util').inspect(mockFeaturesConfig, { depth: null }))
    });
    // it('should return existing config', async () => {
    //   const result = await service.getOrCreate();
    //
    //   expect(result).toEqual(mockFeaturesConfig);
    // });
    // it('should create new config', async () => {
    //   repository.findOneBy.mockResolvedValueOnce(null);
    //
    //   const result = await service.getOrCreate();
    //
    //   expect(result).toEqual({
    //     ...mockAgreements,
    //     version: undefined,
    //     data: undefined,
    //   });
    // });
  });

  // describe('update', () => {
  //   it('should update agreements', async () => {
  //     const result = await service.update(mockUserId, mockAgreements);
  //
  //     expect(result).toEqual(mockAgreements);
  //     expect(repository.update).toHaveBeenCalledWith({}, {
  //       ...mockAgreementsEntity,
  //     });
  //   });
  // });
});
