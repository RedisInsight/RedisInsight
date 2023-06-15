import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import {
  CloudDatabase,
  CloudDatabaseStatus,
  CloudSubscription,
  CloudSubscriptionStatus,
} from 'src/modules/cloud/autodiscovery/models';

@Injectable()
export class CloudAutodiscoveryAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendGetRECloudSubsSucceedEvent(subscriptions: CloudSubscription[] = []) {
    try {
      this.sendEvent(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: subscriptions.filter(
            (sub) => sub.status === CloudSubscriptionStatus.Active,
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

  sendGetRECloudDbsSucceedEvent(databases: CloudDatabase[] = []) {
    try {
      this.sendEvent(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: databases.filter(
            (db) => db.status === CloudDatabaseStatus.Active,
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
