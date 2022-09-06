import { Injectable, InternalServerErrorException, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import config from 'src/utils/config';
import { AppAnalyticsEvents } from 'src/constants/app-events';
import { TelemetryEvents } from 'src/constants/telemetry-events';
import { GetServerInfoResponse } from 'src/dto/server.dto';
import { AppType, BuildType, IServerProvider } from 'src/modules/core/models/server-provider.interface';
import { ServerInfoNotFoundException } from 'src/constants/exceptions';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServerEntity } from 'src/modules/core/models/server.entity';

const SERVER_CONFIG = config.get('server');
const REDIS_STACK_CONFIG = config.get('redisStack');

@Injectable()
export class ServerOnPremiseService
implements OnApplicationBootstrap, IServerProvider {
  private logger = new Logger('ServerOnPremiseService');

  private sessionId: number;

  constructor(
    @InjectRepository(ServerEntity)
    private readonly repository: Repository<ServerEntity>,
    private readonly eventEmitter: EventEmitter2,
    private readonly encryptionService: EncryptionService,
  ) {}

  async onApplicationBootstrap(sessionId: number = new Date().getTime()) {
    this.sessionId = sessionId;
    await this.upsertServerInfo();
  }

  private async upsertServerInfo() {
    this.logger.log('Checking server info.');
    let serverInfo = await this.repository.findOne({});
    if (!serverInfo) {
      this.logger.log('First application launch.');
      // Create default server info on first application launch
      serverInfo = this.repository.create({});
      await this.repository.save(serverInfo);
      this.eventEmitter.emit(AppAnalyticsEvents.Initialize, {
        anonymousId: serverInfo.id,
        sessionId: this.sessionId,
        appType: this.getAppType(SERVER_CONFIG.buildType),
      });
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
      this.eventEmitter.emit(AppAnalyticsEvents.Initialize, {
        anonymousId: serverInfo.id,
        sessionId: this.sessionId,
        appType: this.getAppType(SERVER_CONFIG.buildType),
      });
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
      const info = await this.repository.findOne({});
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
