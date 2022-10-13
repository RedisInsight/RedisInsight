import { Test, TestingModule } from '@nestjs/testing';
import { cloneDeep } from 'lodash';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  mockAgreementsEntity,
  mockAgreementsJSON, mockEncryptionStrategy,
  mockSettingsAnalyticsService,
  mockSettingsEntity,
  mockSettingsJSON,
  MockType,
} from 'src/__mocks__';
import { GetAppSettingsResponse, UpdateSettingsDto } from 'src/modules/settings/dto/settings.dto';
import * as AGREEMENTS_SPEC from 'src/constants/agreements-spec.json';
import { AgreementIsNotDefinedException } from 'src/constants';
import config from 'src/utils/config';
import { SettingsEntity } from 'src/modules/settings/entities/settings.entity';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { EncryptionStrategy } from 'src/modules/core/encryption/models';
import { KeytarEncryptionStrategy } from 'src/modules/core/encryption/strategies/keytar-encryption.strategy';
import { SettingsAnalytics } from 'src/modules/settings/settings.analytics';
import { SettingsService } from 'src/modules/settings/settings.service';
import { AgreementsRepository } from 'src/modules/settings/repositories/agreements.repository';
import { SettingsRepository } from 'src/modules/settings/repositories/settings.repository';
import Mock = jest.Mock;
import { Agreements } from 'src/modules/settings/models/agreements';
import { Settings } from 'src/modules/settings/models/settings';

const REDIS_SCAN_CONFIG = config.get('redis_scan');
const WORKBENCH_CONFIG = config.get('workbench');

const mockAgreementsMap = new Map(
  Object.keys(AGREEMENTS_SPEC.agreements).map((item: string) => [
    item,
    true,
  ]),
);

const mockAgreementsRepository = jest.fn(() => ({
  getOrCreate: jest.fn(),
  update: jest.fn(),
}));

const mockSettingsRepository = jest.fn(() => ({
  getOrCreate: jest.fn(),
  update: jest.fn(),
}));

const mockUserId = '1';

const mockSettings = {
  id: mockUserId,
  data: {
    theme: 'DARK',
    scanThreshold: 500,
    batchSize: 10,
  },
} as Settings;

const mockAgreements = {
  id: mockUserId,
  version: '1.0.0',
  data: {
    eula: true,
    analytics: true,
    encryption: true,
    notifications: true,
  },
} as Agreements;

const mockAppSettings = {
  ...mockSettings.data,
  agreements: {
    version: mockAgreements.version,
    ...mockAgreements.data,
  },
} as GetAppSettingsResponse;

describe('SettingsService', () => {
  let service: SettingsService;
  let agreementsRepository: MockType<AgreementsRepository>;
  let settingsRepository: MockType<SettingsRepository>;
  let analyticsService: SettingsAnalytics;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: SettingsAnalytics,
          useFactory: mockSettingsAnalyticsService,
        },
        {
          provide: AgreementsRepository,
          useFactory: mockAgreementsRepository,
        },
        {
          provide: SettingsRepository,
          useFactory: mockSettingsRepository,
        },
        {
          provide: KeytarEncryptionStrategy,
          useFactory: mockEncryptionStrategy,
        },
      ],
    }).compile();

    agreementsRepository = await module.get(AgreementsRepository);
    settingsRepository = await module.get(SettingsRepository);
    analyticsService = await module.get<SettingsAnalytics>(SettingsAnalytics);
    service = await module.get(SettingsService);
  });

  describe('getAppSettings', () => {
    it('should return default application settings', async () => {
      agreementsRepository.getOrCreate.mockResolvedValue(new Agreements());
      settingsRepository.getOrCreate.mockResolvedValue(new Settings());

      const result = await service.getAppSettings(mockUserId);

      expect(result).toEqual({
        theme: null,
        scanThreshold: REDIS_SCAN_CONFIG.countThreshold,
        batchSize: WORKBENCH_CONFIG.countBatch,
        agreements: null,
      });
    });
    it('should return some application settings already defined by user', async () => {
      agreementsRepository.getOrCreate.mockResolvedValue(mockAgreements);
      settingsRepository.getOrCreate.mockResolvedValue(mockSettings);

      const result = await service.getAppSettings(mockUserId);

      expect(result).toEqual({
        ...mockSettings.data,
        agreements: {
          version: mockAgreements.version,
          ...mockAgreements.data,
        },
      });
    });
    it('should throw InternalServerError', async () => {
      agreementsRepository.getOrCreate.mockRejectedValue(new Error('some error'));

      try {
        await service.getAppSettings(mockUserId);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('updateAppSettings', () => {
    beforeEach(() => {
      settingsRepository.getOrCreate.mockResolvedValue(mockSettings);
      settingsRepository.update.mockResolvedValue(mockSettings);
      agreementsRepository.getOrCreate.mockResolvedValue(mockAgreements);
      agreementsRepository.update.mockResolvedValue(mockAgreements);
    });
    it('should update settings only', async () => {
      const dto: UpdateSettingsDto = {
        scanThreshold: 1001,
      };

      const response = await service.updateAppSettings(mockUserId, dto);
      expect(agreementsRepository.update).not.toHaveBeenCalled();
      expect(settingsRepository.update).toHaveBeenCalledWith(mockUserId, {
        ...mockSettings,
        data: {
          ...mockSettings.data,
          ...dto,
        },
      });
      expect(response).toEqual(mockAppSettings);
    });
    // it('should update agreements and settings', async () => {
    //   const dto: UpdateSettingsDto = {
    //     scanThreshold: 1000,
    //     batchSize: 10,
    //     agreements: mockAgreementsMap,
    //   };
    //   const mockUpdatedAgreements = {
    //     ...agreementsEntity,
    //     version: AGREEMENTS_SPEC.version,
    //     data: JSON.stringify(Object.fromEntries(dto.agreements)),
    //   };
    //
    //   await service.updateSettings(dto);
    //
    //   expect(agreementsRepository.save).toHaveBeenCalledWith(
    //     mockUpdatedAgreements,
    //   );
    //   expect(settingsRepository.save).toHaveBeenCalledWith({
    //     ...settingsEntity,
    //     data: JSON.stringify({ ...mockSettingsJSON, scanThreshold: 1000, batchSize: 10 }),
    //   });
    //   expect(service.getSettings).toHaveBeenCalled();
    //   expect(analyticsService.sendAnalyticsAgreementChange).toHaveBeenCalled();
    // });
    // it('should update only settings', async () => {
    //   const dto: UpdateSettingsDto = {
    //     scanThreshold: 1000,
    //     batchSize: 10,
    //   };
    //
    //   await service.updateSettings(dto);
    //
    //   expect(settingsRepository.save).toHaveBeenCalledWith({
    //     ...settingsEntity,
    //     data: JSON.stringify({
    //       ...mockSettingsJSON,
    //       scanThreshold: 1000,
    //       batchSize: 10,
    //     }),
    //   });
    //   expect(service.getSettings).toHaveBeenCalled();
    //   expect(agreementsRepository.save).not.toHaveBeenCalled();
    //   expect(analyticsService.sendAnalyticsAgreementChange).not.toHaveBeenCalled();
    // });
    // it('should update only agreements', async () => {
    //   const dto: UpdateSettingsDto = {
    //     agreements: mockAgreementsMap,
    //   };
    //   const mockUpdatedAgreements = {
    //     ...agreementsEntity,
    //     version: AGREEMENTS_SPEC.version,
    //     data: JSON.stringify(Object.fromEntries(dto.agreements)),
    //   };
    //
    //   await service.updateSettings(dto);
    //
    //   expect(agreementsRepository.save).toHaveBeenCalledWith(
    //     mockUpdatedAgreements,
    //   );
    //   expect(settingsRepository.save).not.toHaveBeenCalled();
    //   expect(service.getSettings).toHaveBeenCalled();
    //   expect(analyticsService.sendAnalyticsAgreementChange).toHaveBeenCalled();
    // });
    // it('should throw AgreementIsNotDefinedException', async () => {
    //   agreementsRepository.findOneBy.mockResolvedValueOnce({
    //     id: 1,
    //     version: null,
    //     data: null,
    //   });
    //
    //   try {
    //     await service.updateSettings({ agreements: new Map([]) });
    //   } catch (err) {
    //     expect(err).toBeInstanceOf(AgreementIsNotDefinedException);
    //   }
    // });
    // it('should throw InternalServerError', async () => {
    //   const dto: UpdateSettingsDto = {
    //     agreements: mockAgreementsMap,
    //   };
    //   agreementsRepository.findOneBy.mockRejectedValue(new Error('some error'));
    //
    //   try {
    //     await service.updateSettings(dto);
    //     fail('Should throw an error');
    //   } catch (err) {
    //     expect(err).toBeInstanceOf(InternalServerErrorException);
    //   }
    // });
  });
});
