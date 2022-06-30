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
import { UpdateSettingsDto } from 'src/dto/settings.dto';
import * as AGREEMENTS_SPEC from 'src/constants/agreements-spec.json';
import { AgreementIsNotDefinedException } from 'src/constants';
import config from 'src/utils/config';
import { SettingsEntity } from 'src/modules/core/models/settings.entity';
import { AgreementsEntity } from 'src/modules/core/models/agreements.entity';
import { SettingsAnalyticsService } from 'src/modules/core/services/settings-analytics/settings-analytics.service';
import { EncryptionStrategy } from 'src/modules/core/encryption/models';
import { KeytarEncryptionStrategy } from 'src/modules/core/encryption/strategies/keytar-encryption.strategy';
import { SettingsOnPremiseService } from './settings-on-premise.service';

const REDIS_SCAN_CONFIG = config.get('redis_scan');
const WORKBENCH_CONFIG = config.get('workbench');

const mockAgreementsMap = new Map(
  Object.keys(AGREEMENTS_SPEC.agreements).map((item: string) => [
    item,
    true,
  ]),
);

describe('SettingsOnPremiseService', () => {
  let service: SettingsOnPremiseService;
  let agreementsRepository: MockType<Repository<AgreementsEntity>>;
  let settingsRepository: MockType<Repository<SettingsEntity>>;
  let agreementsEntity: AgreementsEntity;
  let settingsEntity: SettingsEntity;
  let analyticsService: SettingsAnalyticsService;
  let keytarEncryptionStrategy: KeytarEncryptionStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SettingsAnalyticsService,
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
    keytarEncryptionStrategy = await module.get(KeytarEncryptionStrategy);
    service = new SettingsOnPremiseService(
      agreementsRepository,
      settingsRepository,
      analyticsService,
      keytarEncryptionStrategy,
    );
  });

  describe('onModuleInit', () => {
    it('should create settings and agreements instance on first application launch', async () => {
      agreementsRepository.findOne.mockResolvedValue(null);
      agreementsRepository.create.mockReturnValue(agreementsEntity);
      settingsRepository.findOne.mockResolvedValue(null);
      settingsRepository.create.mockReturnValue(settingsEntity);

      await service.onModuleInit();

      expect(agreementsRepository.findOne).toHaveBeenCalled();
      expect(settingsRepository.findOne).toHaveBeenCalled();
      expect(agreementsRepository.create).toHaveBeenCalled();
      expect(settingsRepository.create).toHaveBeenCalled();
      expect(agreementsRepository.save).toHaveBeenCalledWith(agreementsEntity);
      expect(settingsRepository.save).toHaveBeenCalledWith(settingsEntity);
    });
    it('should not create settings and agreements  on the second application launch', async () => {
      agreementsRepository.findOne.mockResolvedValue(agreementsEntity);
      settingsRepository.findOne.mockResolvedValue(settingsEntity);

      await service.onModuleInit();

      expect(agreementsRepository.findOne).toHaveBeenCalled();
      expect(agreementsRepository.create).not.toHaveBeenCalled();
      expect(agreementsRepository.save).not.toHaveBeenCalled();
      expect(settingsRepository.findOne).toHaveBeenCalled();
      expect(settingsRepository.create).not.toHaveBeenCalled();
      expect(settingsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getSettings', () => {
    it('should return default application settings', async () => {
      agreementsRepository.findOne.mockResolvedValue(agreementsEntity);
      settingsRepository.findOne.mockResolvedValue(settingsEntity);

      const result = await service.getSettings();

      expect(result).toEqual({
        theme: null,
        scanThreshold: REDIS_SCAN_CONFIG.countThreshold,
        pipelineBunch: WORKBENCH_CONFIG.countBunch,
        agreements: null,
      });
    });
    it('should return some application settings already defined by user', async () => {
      settingsEntity.toJSON = jest.fn().mockReturnValue({
        ...mockSettingsJSON,
        theme: 'DARK',
        scanThreshold: 500,
        pipelineBunch: 10,
        encryptionStrategy: EncryptionStrategy.KEYTAR,
      });
      agreementsEntity.toJSON = jest.fn().mockReturnValue({
        ...mockAgreementsJSON,
        version: '1.0.0',
        eula: true,
      });
      agreementsRepository.findOne.mockResolvedValue(agreementsEntity);
      settingsRepository.findOne.mockResolvedValue(settingsEntity);

      const result = await service.getSettings();

      expect(result).toEqual({
        ...mockSettingsJSON,
        theme: 'DARK',
        scanThreshold: 500,
        pipelineBunch: 10,
        encryptionStrategy: EncryptionStrategy.KEYTAR,
        agreements: {
          version: '1.0.0',
          eula: true,
        },
      });
    });
    it('should throw InternalServerError', async () => {
      agreementsRepository.findOne.mockRejectedValue(new Error('some error'));

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
      settingsRepository.findOne.mockResolvedValue(settingsEntity);
      agreementsRepository.findOne.mockResolvedValue(agreementsEntity);
      service.getSettings = jest.fn();
    });
    it('should update agreements and settings', async () => {
      const dto: UpdateSettingsDto = {
        scanThreshold: 1000,
        pipelineBunch: 10,
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
        data: JSON.stringify({ ...mockSettingsJSON, scanThreshold: 1000, pipelineBunch: 10 }),
      });
      expect(service.getSettings).toHaveBeenCalled();
      expect(analyticsService.sendAnalyticsAgreementChange).toHaveBeenCalled();
    });
    it('should update only settings', async () => {
      const dto: UpdateSettingsDto = {
        scanThreshold: 1000,
        pipelineBunch: 10,
      };

      await service.updateSettings(dto);

      expect(settingsRepository.save).toHaveBeenCalledWith({
        ...settingsEntity,
        data: JSON.stringify({
          ...mockSettingsJSON,
          scanThreshold: 1000,
          pipelineBunch: 10,
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
      agreementsRepository.findOne.mockResolvedValueOnce({
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
      agreementsRepository.findOne.mockRejectedValue(new Error('some error'));

      try {
        await service.updateSettings(dto);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
