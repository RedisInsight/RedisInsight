import { countBy } from 'lodash';
import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import {
  CloudAutodiscoveryAuthType,
} from 'src/modules/cloud/autodiscovery/models';
import {
  CloudSubscription,
  CloudSubscriptionStatus,
  CloudSubscriptionType,
} from 'src/modules/cloud/subscription/models';
import { CloudDatabase, CloudDatabaseStatus } from 'src/modules/cloud/database/models';

@Injectable()
export class CloudAutodiscoveryAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendGetRECloudSubsSucceedEvent(
    subscriptions: CloudSubscription[] = [],
    type: CloudSubscriptionType,
    authType: CloudAutodiscoveryAuthType,
  ) {
    try {
      this.sendEvent(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: subscriptions.filter(
            (sub) => sub.status === CloudSubscriptionStatus.Active,
          ).length,
          totalNumberOfSubscriptions: subscriptions.length,
          type,
          authType,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendGetRECloudSubsFailedEvent(
    exception: HttpException,
    type: CloudSubscriptionType,
    authType: CloudAutodiscoveryAuthType,
  ) {
    this.sendFailedEvent(
      TelemetryEvents.RECloudSubscriptionsDiscoveryFailed,
      exception,
      {
        type,
        authType,
      },
    );
  }

  sendGetRECloudDbsSucceedEvent(databases: CloudDatabase[] = [], authType: CloudAutodiscoveryAuthType) {
    try {
      this.sendEvent(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: databases.filter(
            (db) => db.status === CloudDatabaseStatus.Active,
          ).length,
          numberOfFreeDatabases: databases.filter(
            (db) => db.cloudDetails?.free === true,
          ).length,
          totalNumberOfDatabases: databases.length,
          fixed: 0,
          flexible: 0,
          ...countBy(databases, 'subscriptionType'),
          authType,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendGetRECloudDbsFailedEvent(exception: HttpException, authType: CloudAutodiscoveryAuthType) {
    this.sendFailedEvent(TelemetryEvents.RECloudDatabasesDiscoveryFailed, exception, { authType });
  }
}
