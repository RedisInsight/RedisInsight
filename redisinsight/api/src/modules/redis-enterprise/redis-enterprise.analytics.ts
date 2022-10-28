import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { RedisEnterpriseDatabase } from 'src/modules/redis-enterprise/dto/cluster.dto';
import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';
import { RedisCloudSubscriptionStatus } from 'src/modules/redis-enterprise/models/redis-cloud-subscriptions';
import { GetRedisCloudSubscriptionResponse, RedisCloudDatabase } from 'src/modules/redis-enterprise/dto/cloud.dto';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';

@Injectable()
export class RedisEnterpriseAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendGetREClusterDbsSucceedEvent(databases: RedisEnterpriseDatabase[] = []): void {
    try {
      this.sendEvent(
        TelemetryEvents.REClusterDiscoverySucceed,
        {
          numberOfActiveDatabases: databases.filter(
            (db) => db.status === RedisEnterpriseDatabaseStatus.Active,
          ).length,
          totalNumberOfDatabases: databases.length,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendGetREClusterDbsFailedEvent(exception: HttpException) {
    this.sendFailedEvent(TelemetryEvents.REClusterDiscoveryFailed, exception);
  }

  sendGetRECloudSubsSucceedEvent(subscriptions: GetRedisCloudSubscriptionResponse[] = []) {
    try {
      this.sendEvent(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: subscriptions.filter(
            (sub) => sub.status === RedisCloudSubscriptionStatus.Active,
          ).length,
          totalNumberOfSubscriptions: subscriptions.length,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendGetRECloudSubsFailedEvent(exception: HttpException) {
    this.sendFailedEvent(TelemetryEvents.RECloudSubscriptionsDiscoveryFailed, exception);
  }

  sendGetRECloudDbsSucceedEvent(databases: RedisCloudDatabase[] = []) {
    try {
      this.sendEvent(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: databases.filter(
            (db) => db.status === RedisEnterpriseDatabaseStatus.Active,
          ).length,
          totalNumberOfDatabases: databases.length,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendGetRECloudDbsFailedEvent(exception: HttpException) {
    this.sendFailedEvent(TelemetryEvents.RECloudDatabasesDiscoveryFailed, exception);
  }
}
