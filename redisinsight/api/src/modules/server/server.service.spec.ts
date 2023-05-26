import { TestingModule, Test } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import {
  mockControlGroup,
  mockControlNumber,
  mockEncryptionService,
  mockFeaturesConfigService,
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
import { ServerEntity } from 'src/modules/server/entities/server.entity';
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
  },
  nonTracking: true,
};

describe('ServerService', () => {
  let service: ServerService;
  let serverRepository: MockType<ServerRepository>;
  let eventEmitter: EventEmitter2;
  let emitSpy;
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

    emitSpy = jest.spyOn(eventEmitter, 'emit');
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
    // it('should not create server instance on the second application launch', async () => {
    //   serverRepository.findOneBy.mockResolvedValue(mockServerEntity);
    //
    //   await service.onApplicationBootstrap();
    //
    //   expect(serverRepository.findOneBy).toHaveBeenCalled();
    //   expect(serverRepository.create).not.toHaveBeenCalled();
    //   expect(serverRepository.save).not.toHaveBeenCalled();
    // });

    // it('should emit APPLICATION_FIRST_START on first application launch', async () => {
    //   serverRepository.findOneBy.mockResolvedValue(null);
    //   serverRepository.create.mockReturnValue(mockServerEntity);
    //
    //   await service.onApplicationBootstrap(sessionId);
    //
    //   expect(eventEmitter.emit).toHaveBeenNthCalledWith(
    //     1,
    //     AppAnalyticsEvents.Initialize,
    //     { anonymousId: mockServerEntity.id, sessionId, appType: SERVER_CONFIG.buildType },
    //   );
    //   expect(eventEmitter.emit).toHaveBeenNthCalledWith(
    //     2,
    //     AppAnalyticsEvents.Track,
    //     {
    //       ...mockEventPayload,
    //       event: TelemetryEvents.ApplicationFirstStart,
    //     },
    //   );
    // });

    // it('should emit APPLICATION_STARTED on second application launch', async () => {
    //   serverRepository.findOneBy.mockResolvedValue(mockServerEntity);
    //
    //   await service.onApplicationBootstrap(sessionId);
    //
    //   expect(eventEmitter.emit).toHaveBeenNthCalledWith(
    //     1,
    //     AppAnalyticsEvents.Initialize,
    //     { anonymousId: mockServerEntity.id, sessionId, appType: SERVER_CONFIG.buildType },
    //   );
    //   expect(eventEmitter.emit).toHaveBeenNthCalledWith(
    //     2,
    //     AppAnalyticsEvents.Track,
    //     {
    //       ...mockEventPayload,
    //       event: TelemetryEvents.ApplicationStarted,
    //     },
    //   );
    // });
  });

  // describe('getInfo', () => {
  //   it('should return server info', async () => {
  //     serverRepository.findOneBy.mockResolvedValue(mockServerEntity);
  //     encryptionService.getAvailableEncryptionStrategies.mockResolvedValue([
  //       EncryptionStrategy.PLAIN,
  //       EncryptionStrategy.KEYTAR,
  //     ]);
  //     const result = await service.getInfo();
  //
  //     expect(result).toEqual({
  //       ...mockServerEntity,
  //       appVersion: SERVER_CONFIG.appVersion,
  //       osPlatform: process.platform,
  //       buildType: SERVER_CONFIG.buildType,
  //       appType: SERVER_CONFIG.buildType,
  //       encryptionStrategies: [
  //         EncryptionStrategy.PLAIN,
  //         EncryptionStrategy.KEYTAR,
  //       ],
  //     });
  //   });
  //   it('should throw ServerInfoNotFoundException', async () => {
  //     serverRepository.findOneBy.mockResolvedValue(null);
  //
  //     try {
  //       await service.getInfo();
  //     } catch (err) {
  //       expect(err).toBeInstanceOf(ServerInfoNotFoundException);
  //       expect(err.message).toEqual(ERROR_MESSAGES.SERVER_INFO_NOT_FOUND());
  //     }
  //   });
  //   it('should throw InternalServerError', async () => {
  //     serverRepository.findOneBy.mockRejectedValue(new Error('some error'));
  //
  //     try {
  //       await service.getInfo();
  //       fail('Should throw an error');
  //     } catch (err) {
  //       expect(err).toBeInstanceOf(InternalServerErrorException);
  //     }
  //   });
  // });
});
