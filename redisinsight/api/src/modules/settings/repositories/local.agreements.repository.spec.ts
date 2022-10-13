import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  mockAgreementsEntity,
  mockAgreementsJSON, mockEncryptionStrategy,
  mockRepository,
  mockSettingsAnalyticsService,
  mockSettingsEntity,
  mockSettingsJSON,
  MockType,
} from 'src/__mocks__';
import { UpdateSettingsDto } from 'src/modules/settings/dto/settings.dto';
import * as AGREEMENTS_SPEC from 'src/constants/agreements-spec.json';
import { AgreementIsNotDefinedException } from 'src/constants';
import config from 'src/utils/config';
import { SettingsEntity } from 'src/modules/settings/entities/settings.entity';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { EncryptionStrategy } from 'src/modules/core/encryption/models';
import { KeytarEncryptionStrategy } from 'src/modules/core/encryption/strategies/keytar-encryption.strategy';
import { SettingsAnalytics } from 'src/modules/settings/settings.analytics';
import { SettingsService } from 'src/modules/settings/settings.service';

const REDIS_SCAN_CONFIG = config.get('redis_scan');
const WORKBENCH_CONFIG = config.get('workbench');

const mockAgreementsMap = new Map(
  Object.keys(AGREEMENTS_SPEC.agreements).map((item: string) => [
    item,
    true,
  ]),
);

describe('SettingsOnPremiseService', () => {
  let service: SettingsService;
  let agreementsRepository: MockType<Repository<AgreementsEntity>>;
  let settingsRepository: MockType<Repository<SettingsEntity>>;
  let agreementsEntity: AgreementsEntity;
  let settingsEntity: SettingsEntity;
  let analyticsService: SettingsAnalytics;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: SettingsAnalytics,
          useFactory: mockSettingsAnalyticsService,
        },
        {
          provide: getRepositoryToken(AgreementsEntity),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SettingsEntity),
          useFactory: mockRepository,
        },
        {
          provide: KeytarEncryptionStrategy,
          useFactory: mockEncryptionStrategy,
        },
      ],
    }).compile();

    settingsEntity = {
      ...mockSettingsEntity,
      toJSON: jest.fn().mockReturnValue({ ...mockSettingsJSON }),
    };
    agreementsEntity = {
      ...mockAgreementsEntity,
      toJSON: jest.fn().mockReturnValue({ ...mockAgreementsJSON }),
    };
    agreementsRepository = await module.get(
      getRepositoryToken(AgreementsEntity),
    );
    settingsRepository = await module.get(getRepositoryToken(SettingsEntity));
    analyticsService = await module.get<SettingsAnalyticsService>(SettingsAnalyticsService);
    service = await module.get(SettingsService);
  });

  describe('getAppSettings', () => {
    it('should return default application settings', async () => {
      agreementsRepository.findOneBy.mockResolvedValue(agreementsEntity);
      settingsRepository.findOneBy.mockResolvedValue(settingsEntity);

      const result = await service.getAppSettings();

      expect(result).toEqual({
        theme: null,
        scanThreshold: REDIS_SCAN_CONFIG.countThreshold,
        batchSize: WORKBENCH_CONFIG.countBatch,
        agreements: null,
      });
    });
    it('should return some application settings already defined by user', async () => {
      settingsEntity.toJSON = jest.fn().mockReturnValue({
        ...mockSettingsJSON,
        theme: 'DARK',
        scanThreshold: 500,
        batchSize: 10,
        encryptionStrategy: EncryptionStrategy.KEYTAR,
      });
      agreementsEntity.toJSON = jest.fn().mockReturnValue({
        ...mockAgreementsJSON,
        version: '1.0.0',
        eula: true,
      });
      agreementsRepository.findOneBy.mockResolvedValue(agreementsEntity);
      settingsRepository.findOneBy.mockResolvedValue(settingsEntity);

      const result = await service.getSettings();

      expect(result).toEqual({
        ...mockSettingsJSON,
        theme: 'DARK',
        scanThreshold: 500,
        batchSize: 10,
        encryptionStrategy: EncryptionStrategy.KEYTAR,
        agreements: {
          version: '1.0.0',
          eula: true,
        },
      });
    });
    it('should throw InternalServerError', async () => {
      agreementsRepository.findOneBy.mockRejectedValue(new Error('some error'));

      try {
        await service.getSettings();
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('updateSettings', () => {
    beforeEach(() => {
      settingsEntity.toJSON = jest.fn().mockReturnValue({
        ...mockSettingsJSON,
      });
      agreementsEntity.toJSON = jest.fn().mockReturnValue({
        ...mockAgreementsJSON,
      });
      settingsRepository.findOneBy.mockResolvedValue(settingsEntity);
      agreementsRepository.findOneBy.mockResolvedValue(agreementsEntity);
      service.getSettings = jest.fn();
    });
    it('should update agreements and settings', async () => {
      const dto: UpdateSettingsDto = {
        scanThreshold: 1000,
        batchSize: 10,
        agreements: mockAgreementsMap,
      };
      const mockUpdatedAgreements = {
        ...agreementsEntity,
        version: AGREEMENTS_SPEC.version,
        data: JSON.stringify(Object.fromEntries(dto.agreements)),
      };

      await service.updateSettings(dto);

      expect(agreementsRepository.save).toHaveBeenCalledWith(
        mockUpdatedAgreements,
      );
      expect(settingsRepository.save).toHaveBeenCalledWith({
        ...settingsEntity,
        data: JSON.stringify({ ...mockSettingsJSON, scanThreshold: 1000, batchSize: 10 }),
      });
      expect(service.getSettings).toHaveBeenCalled();
      expect(analyticsService.sendAnalyticsAgreementChange).toHaveBeenCalled();
    });
    it('should update only settings', async () => {
      const dto: UpdateSettingsDto = {
        scanThreshold: 1000,
        batchSize: 10,
      };

      await service.updateSettings(dto);

      expect(settingsRepository.save).toHaveBeenCalledWith({
        ...settingsEntity,
        data: JSON.stringify({
          ...mockSettingsJSON,
          scanThreshold: 1000,
          batchSize: 10,
        }),
      });
      expect(service.getSettings).toHaveBeenCalled();
      expect(agreementsRepository.save).not.toHaveBeenCalled();
      expect(analyticsService.sendAnalyticsAgreementChange).not.toHaveBeenCalled();
    });
    it('should update only agreements', async () => {
      const dto: UpdateSettingsDto = {
        agreements: mockAgreementsMap,
      };
      const mockUpdatedAgreements = {
        ...agreementsEntity,
        version: AGREEMENTS_SPEC.version,
        data: JSON.stringify(Object.fromEntries(dto.agreements)),
      };

      await service.updateSettings(dto);

      expect(agreementsRepository.save).toHaveBeenCalledWith(
        mockUpdatedAgreements,
      );
      expect(settingsRepository.save).not.toHaveBeenCalled();
      expect(service.getSettings).toHaveBeenCalled();
      expect(analyticsService.sendAnalyticsAgreementChange).toHaveBeenCalled();
    });
    it('should throw AgreementIsNotDefinedException', async () => {
      agreementsRepository.findOneBy.mockResolvedValueOnce({
        id: 1,
        version: null,
        data: null,
      });

      try {
        await service.updateSettings({ agreements: new Map([]) });
      } catch (err) {
        expect(err).toBeInstanceOf(AgreementIsNotDefinedException);
      }
    });
    it('should throw InternalServerError', async () => {
      const dto: UpdateSettingsDto = {
        agreements: mockAgreementsMap,
      };
      agreementsRepository.findOneBy.mockRejectedValue(new Error('some error'));

      try {
        await service.updateSettings(dto);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
