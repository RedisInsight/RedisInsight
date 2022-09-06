import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { mockEncryptionService, mockRepository, MockType } from 'src/__mocks__';
import config from 'src/utils/config';
import {
  ServerInfoNotFoundException,
  AppAnalyticsEvents,
  TelemetryEvents,
} from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ServerEntity } from 'src/modules/core/models/server.entity';
import { ITelemetryEvent } from 'src/modules/core/services/analytics/analytics.service';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { EncryptionStrategy } from 'src/modules/core/encryption/models';
import { ServerOnPremiseService } from './server-on-premise.service';

const SERVER_CONFIG = config.get('server');

const mockServerEntity: ServerEntity = {
  id: 'a77b23c1-7816-4ea4-b61f-d37795a0f805',
  createDateTime: '2021-01-06T12:44:39.000Z',
};

const mockEventPayload: ITelemetryEvent = {
  event: TelemetryEvents.ApplicationStarted,
  eventData: {
    appVersion: SERVER_CONFIG.appVersion,
    osPlatform: process.platform,
    buildType: SERVER_CONFIG.buildType,
  },
  nonTracking: true,
};

describe('ServerOnPremiseService', () => {
  let service: ServerOnPremiseService;
  let serverRepository: MockType<Repository<ServerEntity>>;
  let eventEmitter: EventEmitter2;
  let encryptionService: MockType<EncryptionService>;
  const sessionId = new Date().getTime();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        ServerOnPremiseService,
        {
          provide: getRepositoryToken(ServerEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    serverRepository = await module.get(getRepositoryToken(ServerEntity));
    eventEmitter = await module.get<EventEmitter2>(EventEmitter2);
    encryptionService = module.get(EncryptionService);
    service = module.get(ServerOnPremiseService);
  });

  describe('onApplicationBootstrap', () => {
    beforeEach(() => {
      eventEmitter.emit = jest.fn();
    });
    it('should create server instance on first application launch', async () => {
      serverRepository.findOne.mockResolvedValue(null);
      serverRepository.create.mockReturnValue(mockServerEntity);

      await service.onApplicationBootstrap();

      expect(serverRepository.findOne).toHaveBeenCalled();
      expect(serverRepository.create).toHaveBeenCalled();
      expect(serverRepository.save).toHaveBeenCalledWith(mockServerEntity);
    });
    it('should not create server instance on the second application launch', async () => {
      serverRepository.findOne.mockResolvedValue(mockServerEntity);

      await service.onApplicationBootstrap();

      expect(serverRepository.findOne).toHaveBeenCalled();
      expect(serverRepository.create).not.toHaveBeenCalled();
      expect(serverRepository.save).not.toHaveBeenCalled();
    });
    it('should emit APPLICATION_FIRST_START on first application launch', async () => {
      serverRepository.findOne.mockResolvedValue(null);
      serverRepository.create.mockReturnValue(mockServerEntity);

      await service.onApplicationBootstrap(sessionId);

      expect(eventEmitter.emit).toHaveBeenNthCalledWith(
        1,
        AppAnalyticsEvents.Initialize,
        { anonymousId: mockServerEntity.id, sessionId, appType: SERVER_CONFIG.buildType },
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
    it('should emit APPLICATION_STARTED on second application launch', async () => {
      serverRepository.findOne.mockResolvedValue(mockServerEntity);

      await service.onApplicationBootstrap(sessionId);

      expect(eventEmitter.emit).toHaveBeenNthCalledWith(
        1,
        AppAnalyticsEvents.Initialize,
        { anonymousId: mockServerEntity.id, sessionId, appType: SERVER_CONFIG.buildType },
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
      serverRepository.findOne.mockResolvedValue(mockServerEntity);
      encryptionService.getAvailableEncryptionStrategies.mockResolvedValue([
        EncryptionStrategy.PLAIN,
        EncryptionStrategy.KEYTAR,
      ]);
      const result = await service.getInfo();

      expect(result).toEqual({
        ...mockServerEntity,
        appVersion: SERVER_CONFIG.appVersion,
        osPlatform: process.platform,
        buildType: SERVER_CONFIG.buildType,
        appType: SERVER_CONFIG.buildType,
        encryptionStrategies: [
          EncryptionStrategy.PLAIN,
          EncryptionStrategy.KEYTAR,
        ],
      });
    });
    it('should throw ServerInfoNotFoundException', async () => {
      serverRepository.findOne.mockResolvedValue(null);

      try {
        await service.getInfo();
      } catch (err) {
        expect(err).toBeInstanceOf(ServerInfoNotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.SERVER_INFO_NOT_FOUND());
      }
    });
    it('should throw InternalServerError', async () => {
      serverRepository.findOne.mockRejectedValue(new Error('some error'));

      try {
        await service.getInfo();
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
