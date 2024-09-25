import { TestingModule, Test } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockEncryptionService,
  mockFeaturesConfigService,
  mockGetServerInfoResponse,
  mockServer,
  mockServerRepository,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import config, { Config } from 'src/utils/config';
import {
  ServerInfoNotFoundException,
  AppAnalyticsEvents,
} from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import { ServerService } from 'src/modules/server/server.service';
import { ServerRepository } from 'src/modules/server/repositories/server.repository';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { AppType } from 'src/modules/server/models/server';
import { LocalServerService } from 'src/modules/server/local.server.service';

const SERVER_CONFIG = config.get('server') as Config['server'];

describe('LocalServerService', () => {
  let service: ServerService;
  let serverRepository: MockType<ServerRepository>;
  let eventEmitter: EventEmitter2;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        LocalServerService,
        {
          provide: ServerRepository,
          useFactory: mockServerRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
        {
          provide: FeaturesConfigService,
          useFactory: mockFeaturesConfigService,
        },
      ],
    }).compile();

    serverRepository = module.get(ServerRepository);
    eventEmitter = module.get(EventEmitter2);
    encryptionService = module.get(EncryptionService);
    service = module.get(LocalServerService);
    jest.spyOn(eventEmitter, 'emit');
  });

  describe('onApplicationBootstrap', () => {
    it('should create server instance on first application launch', async () => {
      serverRepository.exists.mockResolvedValueOnce(false);

      await service.init();

      expect(serverRepository.exists).toHaveBeenCalled();
      expect(serverRepository.getOrCreate).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(
        1,
        AppAnalyticsEvents.Initialize,
        {
          anonymousId: mockServer.id,
          sessionId: expect.any(Number),
          appType: AppType.Docker,
          appVersion: SERVER_CONFIG.appVersion,
        },
      );
    });
    it('should not create server instance on the second application launch', async () => {
      serverRepository.exists.mockResolvedValueOnce(true);

      await service.init();

      expect(serverRepository.exists).toHaveBeenCalled();
      expect(serverRepository.getOrCreate).toHaveBeenCalled();

      expect(eventEmitter.emit).toHaveBeenNthCalledWith(
        1,
        AppAnalyticsEvents.Initialize,
        {
          anonymousId: mockServer.id,
          sessionId: expect.any(Number),
          appType: AppType.Docker,
          appVersion: SERVER_CONFIG.appVersion,
        },
      );
    });
  });

  describe('getInfo', () => {
    it('should return server info', async () => {
      encryptionService.getAvailableEncryptionStrategies.mockResolvedValue([
        EncryptionStrategy.PLAIN,
        EncryptionStrategy.KEYTAR,
      ]);
      const result = await service.getInfo(mockSessionMetadata);

      expect(result).toEqual({
        ...mockGetServerInfoResponse,
        sessionId: expect.any(Number),
        packageType: undefined, // should be undefined for non-electron applications
      });
    });
    it('should throw ServerInfoNotFoundException', async () => {
      serverRepository.getOrCreate.mockResolvedValue(null);

      try {
        await service.getInfo(mockSessionMetadata);
      } catch (err) {
        expect(err).toBeInstanceOf(ServerInfoNotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.SERVER_INFO_NOT_FOUND());
      }
    });
    it('should throw InternalServerError', async () => {
      serverRepository.getOrCreate.mockRejectedValue(new Error('some error'));

      try {
        await service.getInfo(mockSessionMetadata);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
