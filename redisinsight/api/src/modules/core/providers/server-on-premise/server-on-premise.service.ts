import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import config from 'src/utils/config';
import { AppAnalyticsEvents } from 'src/constants/app-events';
import { TelemetryEvents } from 'src/constants/telemetry-events';
import { GetServerInfoResponse } from 'src/dto/server.dto';
import { ServerRepository } from 'src/modules/core/repositories/server.repository';
import { IServerProvider } from 'src/modules/core/models/server-provider.interface';
import { ServerInfoNotFoundException } from 'src/constants/exceptions';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';

const SERVER_CONFIG = config.get('server');
const REDIS_STACK_CONFIG = config.get('redisStack');

@Injectable()
export class ServerOnPremiseService
implements OnApplicationBootstrap, IServerProvider {
  private logger = new Logger('ServerOnPremiseService');

  private repository: ServerRepository;

  private eventEmitter: EventEmitter2;

  private encryptionService: EncryptionService;

  private sessionId: number;

  constructor(repository, eventEmitter, encryptionService) {
    this.repository = repository;
    this.eventEmitter = eventEmitter;
    this.encryptionService = encryptionService;
  }

  async onApplicationBootstrap(sessionId: number = new Date().getTime()) {
    this.sessionId = sessionId;
    await this.upsertServerInfo();
  }

  private async upsertServerInfo() {
    this.logger.log('Checking server info.');
    let serverInfo = await this.repository.findOne();
    if (!serverInfo) {
      this.logger.log('First application launch.');
      // Create default server info on first application launch
      serverInfo = this.repository.create({});
      await this.repository.save(serverInfo);
      this.eventEmitter.emit(AppAnalyticsEvents.Initialize, { anonymousId: serverInfo.id, sessionId: this.sessionId });
      this.eventEmitter.emit(AppAnalyticsEvents.Track, {
        event: TelemetryEvents.ApplicationFirstStart,
        eventData: {
          appVersion: SERVER_CONFIG.appVersion,
          osPlatform: process.platform,
          buildType: SERVER_CONFIG.buildType,
        },
        nonTracking: true,
      });
    } else {
      this.logger.log('Application started.');
      this.eventEmitter.emit(AppAnalyticsEvents.Initialize, { anonymousId: serverInfo.id, sessionId: this.sessionId });
      this.eventEmitter.emit(AppAnalyticsEvents.Track, {
        event: TelemetryEvents.ApplicationStarted,
        eventData: {
          appVersion: SERVER_CONFIG.appVersion,
          osPlatform: process.platform,
          buildType: SERVER_CONFIG.buildType,
        },
        nonTracking: true,
      });
    }
  }

  /**
   * Method to get server info
   */
  public async getInfo(): Promise<GetServerInfoResponse> {
    this.logger.log('Getting server info.');
    try {
      const info = await this.repository.findOne();
      if (!info) {
        return Promise.reject(new ServerInfoNotFoundException());
      }
      const result = {
        ...info,
        sessionId: this.sessionId,
        appVersion: SERVER_CONFIG.appVersion,
        osPlatform: process.platform,
        buildType: SERVER_CONFIG.buildType,
        encryptionStrategies: await this.encryptionService.getAvailableEncryptionStrategies(),
        fixedDatabaseId: REDIS_STACK_CONFIG?.id,
      };
      this.logger.log('Succeed to get server info.');
      return result;
    } catch (error) {
      this.logger.error('Failed to get application settings.', error);
      throw new InternalServerErrorException();
    }
  }
}
