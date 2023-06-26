import { countBy } from 'lodash';
import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import {
  CloudDatabase,
  CloudDatabaseStatus,
  CloudSubscription,
  CloudSubscriptionStatus, CloudSubscriptionType,
} from 'src/modules/cloud/autodiscovery/models';

@Injectable()
export class CloudAutodiscoveryAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendGetRECloudSubsSucceedEvent(subscriptions: CloudSubscription[] = [], type: CloudSubscriptionType) {
    try {
      this.sendEvent(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: subscriptions.filter(
            (sub) => sub.status === CloudSubscriptionStatus.Active,
          ).length,
          totalNumberOfSubscriptions: subscriptions.length,
          type,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendGetRECloudSubsFailedEvent(exception: HttpException, type: CloudSubscriptionType) {
    this.sendFailedEvent(TelemetryEvents.RECloudSubscriptionsDiscoveryFailed, exception, { type });
  }

  sendGetRECloudDbsSucceedEvent(databases: CloudDatabase[] = []) {
    try {
      this.sendEvent(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: databases.filter(
            (db) => db.status === CloudDatabaseStatus.Active,
          ).length,
          totalNumberOfDatabases: databases.length,
          fixed: 0,
          flexible: 0,
          ...countBy(databases, 'subscriptionType'),
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
