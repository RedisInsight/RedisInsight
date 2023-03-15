import {
  Injectable, InternalServerErrorException, Logger, OnApplicationBootstrap,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import config from 'src/utils/config';
import { AppAnalyticsEvents } from 'src/constants/app-events';
import { TelemetryEvents } from 'src/constants/telemetry-events';
import { ServerInfoNotFoundException } from 'src/constants/exceptions';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ServerRepository } from 'src/modules/server/repositories/server.repository';
import { AppType, BuildType } from 'src/modules/server/models/server';
import { GetServerInfoResponse } from 'src/modules/server/dto/server.dto';

const SERVER_CONFIG = config.get('server');
const REDIS_STACK_CONFIG = config.get('redisStack');

@Injectable()
export class ServerService implements OnApplicationBootstrap {
  private logger = new Logger('ServerService');

  private sessionId: number;

  constructor(
    private readonly repository: ServerRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly encryptionService: EncryptionService,
  ) {}

  async onApplicationBootstrap(sessionId: number = new Date().getTime()) {
    this.sessionId = sessionId;
    await this.upsertServerInfo();
  }

  // todo: make id required
  private async upsertServerInfo(id: string = '') {
    this.logger.log('Checking server info.');

    let startEvent = TelemetryEvents.ApplicationFirstStart;

    if (await this.repository.exists(id)) {
      this.logger.log('First application launch.');
      startEvent = TelemetryEvents.ApplicationStarted;
    }

    const server = await this.repository.getOrCreate(id);

    this.logger.log('Application started.');

    this.eventEmitter.emit(AppAnalyticsEvents.Initialize, {
      anonymousId: server.id,
      sessionId: this.sessionId,
      appType: this.getAppType(SERVER_CONFIG.buildType),
    });

    // do not track start events for non-electron builds
    if (SERVER_CONFIG?.buildType.toUpperCase() === 'ELECTRON') {
      this.eventEmitter.emit(AppAnalyticsEvents.Track, {
        event: startEvent,
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
  public async getInfo(id = ''): Promise<GetServerInfoResponse> {
    this.logger.log('Getting server info.');
    try {
      const info = await this.repository.getOrCreate(id);
      if (!info) {
        return Promise.reject(new ServerInfoNotFoundException());
      }
      const result = {
        ...info,
        sessionId: this.sessionId,
        appVersion: SERVER_CONFIG.appVersion,
        osPlatform: process.platform,
        buildType: SERVER_CONFIG.buildType,
        appType: this.getAppType(SERVER_CONFIG.buildType),
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

  getAppType(buildType: string): AppType {
    switch (buildType) {
      case BuildType.DockerOnPremise:
        return AppType.Docker;
      case BuildType.Electron:
        return AppType.Electron;
      case BuildType.RedisStack:
        return AppType.RedisStackWeb;
      default:
        return AppType.Unknown;
    }
  }
}
