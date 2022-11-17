import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAppSettings, mockAppSettingsInitial, mockAppSettingsWithoutPermissions,
  mockEncryptionStrategyInstance,
  mockEncryptResult,
  mockSettingsService,
  MockType,
} from 'src/__mocks__';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { PlainEncryptionStrategy } from 'src/modules/encryption/strategies/plain-encryption.strategy';
import { KeytarEncryptionStrategy } from 'src/modules/encryption/strategies/keytar-encryption.strategy';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import { UnsupportedEncryptionStrategyException } from 'src/modules/encryption/exceptions';
import { SettingsService } from 'src/modules/settings/settings.service';

describe('EncryptionService', () => {
  let service: EncryptionService;
  let plainEncryptionStrategy: MockType<PlainEncryptionStrategy>;
  let keytarEncryptionStrategy: MockType<KeytarEncryptionStrategy>;
  let settingsService: MockType<SettingsService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: PlainEncryptionStrategy,
          useFactory: mockEncryptionStrategyInstance,
        },
        {
          provide: KeytarEncryptionStrategy,
          useFactory: mockEncryptionStrategyInstance,
        },
        {
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
      ],
    }).compile();

    service = module.get(EncryptionService);
    plainEncryptionStrategy = module.get(PlainEncryptionStrategy);
    keytarEncryptionStrategy = module.get(KeytarEncryptionStrategy);
    settingsService = module.get(SettingsService);

    settingsService.getAppSettings.mockResolvedValue(mockAppSettings);
  });

  describe('getAvailableEncryptionStrategies', () => {
    it('Should return list 2 strategies available', async () => {
      keytarEncryptionStrategy.isAvailable.mockResolvedValueOnce(true);

      expect(await service.getAvailableEncryptionStrategies()).toEqual([
        EncryptionStrategy.PLAIN,
        EncryptionStrategy.KEYTAR,
      ]);
    });
    it('Should return list with one strategy available', async () => {
      keytarEncryptionStrategy.isAvailable.mockResolvedValueOnce(false);

      expect(await service.getAvailableEncryptionStrategies()).toEqual([
        EncryptionStrategy.PLAIN,
      ]);
    });
  });

  describe('getEncryptionStrategy', () => {
    it('Should return KEYTAR strategy based on app agreements', async () => {
      expect(await service.getEncryptionStrategy()).toEqual(keytarEncryptionStrategy);
    });
    it('Should return PLAIN strategy based on app agreements', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce(mockAppSettingsWithoutPermissions);

      expect(await service.getEncryptionStrategy()).toEqual(plainEncryptionStrategy);
    });
    it('Should throw an error if encryption strategy was not set by user', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce(mockAppSettingsInitial);

      await expect(service.getEncryptionStrategy()).rejects.toThrow(UnsupportedEncryptionStrategyException);
    });
  });

  describe('encrypt', () => {
    it('Should encrypt data and return proper response', async () => {
      keytarEncryptionStrategy.encrypt.mockResolvedValueOnce(mockEncryptResult);

      expect(await service.encrypt('string')).toEqual(mockEncryptResult);
    });
  });

  describe('decrypt', () => {
    it('Should return decrypted string', async () => {
      keytarEncryptionStrategy.decrypt.mockResolvedValueOnce(mockEncryptResult.data);

      expect(await service.decrypt('string', EncryptionStrategy.KEYTAR)).toEqual(mockEncryptResult.data);
    });
    it('Should return null when no data passed', async () => {
      expect(await service.decrypt(null, EncryptionStrategy.KEYTAR)).toEqual(null);
    });
  });
});
