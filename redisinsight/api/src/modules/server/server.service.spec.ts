import { TestingModule, Test } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockControlGroup,
  mockControlNumber,
  mockEncryptionService,
  mockFeaturesConfigService, mockGetServerInfoResponse,
  mockServer,
  mockServerRepository,
  MockType,
} from 'src/__mocks__';
import config from 'src/utils/config';
import {
  ServerInfoNotFoundException,
  AppAnalyticsEvents,
  TelemetryEvents,
} from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ITelemetryEvent } from 'src/modules/analytics/analytics.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import { ServerService } from 'src/modules/server/server.service';
import { ServerRepository } from 'src/modules/server/repositories/server.repository';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';

const SERVER_CONFIG = config.get('server');

const mockEventPayload: ITelemetryEvent = {
  event: TelemetryEvents.ApplicationStarted,
  eventData: {
    appVersion: SERVER_CONFIG.appVersion,
    osPlatform: process.platform,
    buildType: SERVER_CONFIG.buildType,
    port: SERVER_CONFIG.port,
  },
  nonTracking: true,
};

describe('ServerService', () => {
  let service: ServerService;
  let serverRepository: MockType<ServerRepository>;
  let eventEmitter: EventEmitter2;
  let encryptionService: MockType<EncryptionService>;
  const sessionId = new Date().getTime();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        ServerService,
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

    serverRepository = await module.get(ServerRepository);
    eventEmitter = await module.get<EventEmitter2>(EventEmitter2);
    encryptionService = module.get(EncryptionService);
    service = module.get(ServerService);
    jest.spyOn(eventEmitter, 'emit');
  });

  describe('onApplicationBootstrap', () => {
    it('should create server instance on first application launch', async () => {
      serverRepository.exists.mockResolvedValueOnce(false);

      await service.onApplicationBootstrap(sessionId);

      expect(serverRepository.exists).toHaveBeenCalled();
      expect(serverRepository.getOrCreate).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(
        1,
        AppAnalyticsEvents.Initialize,
        {
          anonymousId: mockServer.id,
          sessionId,
          appType: SERVER_CONFIG.buildType,
          controlNumber: mockControlNumber,
          controlGroup: mockControlGroup,
        },
      );
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(
        2,
        AppAnalyticsEvents.Track,
        {
          ...mockEventPayload,
          event: TelemetryEvents.ApplicationFirstStart,
        },
      );
    });
    it('should not create server instance on the second application launch', async () => {
      serverRepository.exists.mockResolvedValueOnce(true);

      await service.onApplicationBootstrap(sessionId);

      expect(serverRepository.exists).toHaveBeenCalled();
      expect(serverRepository.getOrCreate).toHaveBeenCalled();

      expect(eventEmitter.emit).toHaveBeenNthCalledWith(
        1,
        AppAnalyticsEvents.Initialize,
        {
          anonymousId: mockServer.id,
          sessionId,
          appType: SERVER_CONFIG.buildType,
          controlNumber: mockControlNumber,
          controlGroup: mockControlGroup,
        },
      );
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(
        2,
        AppAnalyticsEvents.Track,
        {
          ...mockEventPayload,
          event: TelemetryEvents.ApplicationStarted,
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
      const result = await service.getInfo();

      expect(result).toEqual(mockGetServerInfoResponse);
    });
    it('should throw ServerInfoNotFoundException', async () => {
      serverRepository.getOrCreate.mockResolvedValue(null);

      try {
        await service.getInfo();
      } catch (err) {
        expect(err).toBeInstanceOf(ServerInfoNotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.SERVER_INFO_NOT_FOUND());
      }
    });
    it('should throw InternalServerError', async () => {
      serverRepository.getOrCreate.mockRejectedValue(new Error('some error'));

      try {
        await service.getInfo();
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
