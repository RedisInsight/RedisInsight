import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import {
  mockFeaturesConfigRepository,
  MockType
} from 'src/__mocks__';
import config from 'src/utils/config';
import { SettingsService } from 'src/modules/settings/settings.service';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { AgreementsRepository } from 'src/modules/settings/repositories/agreements.repository';
import { FeaturesConfigRepository } from 'src/modules/feature/repositories/features-config.repository';

const REDIS_SCAN_CONFIG = config.get('redis_scan');
const WORKBENCH_CONFIG = config.get('workbench');

describe('FeaturesConfigService', () => {
  let service: FeaturesConfigService;
  let repository: MockType<FeaturesConfigRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeaturesConfigService,
        {
          provide: FeaturesConfigRepository,
          useFactory: mockFeaturesConfigRepository,
        }
      ],
    }).compile();

    service = module.get(FeaturesConfigService);
  });

  describe('sync', () => {
    it('should sync', async () => {
      await service['sync']();
    });
  });
});
