import { InitService } from 'src/modules/init/init.service';
import { ServerService } from 'src/modules/server/server.service';
import { Injectable } from '@nestjs/common';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';
import { FeatureService } from 'src/modules/feature/feature.service';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { AutodiscoveryService } from 'src/modules/autodiscovery/autodiscovery.service';
import { AnalyticsService } from 'src/modules/analytics/analytics.service';

@Injectable()
export class LocalInitService extends InitService {
  constructor(
    private readonly constantsProvider: ConstantsProvider,
    private readonly serverService: ServerService,
    private readonly featuresConfigService: FeaturesConfigService,
    private readonly featureService: FeatureService,
    private readonly redisClientFactory: RedisClientFactory,
    private readonly autodiscoveryService: AutodiscoveryService,
    private readonly analyticsService: AnalyticsService,
  ) {
    super();
  }

  /**
   * Initialize everything is needed in proper order
   */
  async onModuleInit(): Promise<void> {
    const sessionMetadata = this.constantsProvider.getSystemSessionMetadata();
    const firstStart = await this.serverService.init();
    await this.featuresConfigService.init();
    await this.initAnalytics(firstStart);
    await this.featureService.recalculateFeatureFlags(sessionMetadata);
    await this.redisClientFactory.init();
    await this.autodiscoveryService.init(); // todo: move it out here with new db import implementation
  }

  async initAnalytics(firstStart: boolean) {
    const sessionMetadata = this.constantsProvider.getSystemSessionMetadata();
    const { id, sessionId, appType, appVersion } =
      await this.serverService.getInfo(sessionMetadata);

    await this.analyticsService.init({
      anonymousId: id,
      sessionId,
      appType,
      appVersion,
      ...(await this.featuresConfigService.getControlInfo(sessionMetadata)),
      firstStart,
    });
  }
}
