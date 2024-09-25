import { AppAnalyticsEvents, ServerInfoNotFoundException, TelemetryEvents } from 'src/constants';
import { ServerService } from 'src/modules/server/server.service';
import { ServerRepository } from 'src/modules/server/repositories/server.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { GetServerInfoResponse } from 'src/modules/server/dto/server.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import config, { Config } from 'src/utils/config';
import { SessionMetadata } from 'src/common/models';

const SERVER_CONFIG = config.get('server') as Config['server'];
const ANALYTICS_CONFIG = config.get('analytics') as Config['analytics'];
const REDIS_STACK_CONFIG = config.get('redisStack') as Config['redisStack'];

@Injectable()
export class LocalServerService extends ServerService {
  constructor(
    private readonly repository: ServerRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
  }

  /**
   * @inheritDoc
   */
  public async init(sessionMetadata?: SessionMetadata): Promise<void> {
    this.logger.log('Initializing server module...');

    let startEvent = TelemetryEvents.ApplicationFirstStart;

    if (await this.repository.exists(sessionMetadata)) {
      this.logger.log('First application launch.');
      startEvent = TelemetryEvents.ApplicationStarted;
    }

    const server = await this.repository.getOrCreate(sessionMetadata);

    this.logger.log('Application started.');

    this.eventEmitter.emit(AppAnalyticsEvents.Initialize, {
      anonymousId: server.id,
      sessionId: this.sessionId,
      appType: ServerService.getAppType(SERVER_CONFIG.buildType),
      appVersion: SERVER_CONFIG.appVersion,
      packageType: ServerService.getPackageType(SERVER_CONFIG.buildType),
    });

    // do not track start events for non-electron builds
    if (ANALYTICS_CONFIG.startEvents) {
      this.eventEmitter.emit(AppAnalyticsEvents.Track, {
        event: startEvent,
        eventData: {
          appVersion: SERVER_CONFIG.appVersion,
          osPlatform: process.platform,
          buildType: SERVER_CONFIG.buildType,
          port: SERVER_CONFIG.port,
          packageType: ServerService.getPackageType(SERVER_CONFIG.buildType),
        },
        nonTracking: true,
      });
    }
  }

  /**
   * @inheritDoc
   */
  public async getInfo(sessionMetadata: SessionMetadata): Promise<GetServerInfoResponse> {
    this.logger.log('Getting server info.');
    try {
      const info = await this.repository.getOrCreate(sessionMetadata);

      if (!info) {
        return Promise.reject(new ServerInfoNotFoundException());
      }

      const result = {
        ...info,
        sessionId: this.sessionId,
        appVersion: SERVER_CONFIG.appVersion,
        osPlatform: process.platform,
        buildType: SERVER_CONFIG.buildType,
        appType: ServerService.getAppType(SERVER_CONFIG.buildType),
        encryptionStrategies: await this.encryptionService.getAvailableEncryptionStrategies(),
        fixedDatabaseId: REDIS_STACK_CONFIG?.id,
        packageType: ServerService.getPackageType(SERVER_CONFIG.buildType),
      };

      this.logger.log('Succeed to get server info.');
      return result;
    } catch (error) {
      this.logger.error('Failed to get application settings.', error);
      throw new InternalServerErrorException();
    }
  }
}
