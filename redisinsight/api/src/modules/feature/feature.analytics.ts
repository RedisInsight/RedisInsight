import { forEach, isArray } from 'lodash';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';

@Injectable()
export class FeatureAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  static getReason(error: Error | Error[]): string {
    let reason = error;

    if (isArray(error)) {
      [reason] = error;
    }

    return reason?.constructor?.name || 'UncaughtError';
  }

  sendFeatureFlagConfigUpdated(data: {
    configVersion: number,
    oldVersion: number,
    type?: string,
  }): void {
    try {
      this.sendEvent(
        TelemetryEvents.FeatureFlagConfigUpdated,
        {
          configVersion: data.configVersion,
          oldVersion: data.oldVersion,
          type: data.type,
        },
      );
    } catch (e) {
      // ignore error
    }
  }

  sendFeatureFlagConfigUpdateError(data: {
    error: Error | Error[],
    configVersion?: number,
    type?: string,
  }): void {
    try {
      this.sendEvent(
        TelemetryEvents.FeatureFlagConfigUpdateError,
        {
          configVersion: data.configVersion,
          type: data.type,
          reason: FeatureAnalytics.getReason(data.error),
        },
      );
    } catch (e) {
      // ignore error
    }
  }

  sendFeatureFlagInvalidRemoteConfig(data: {
    error: Error | Error[],
    configVersion?: number,
    type?: string,
  }): void {
    try {
      this.sendEvent(
        TelemetryEvents.FeatureFlagInvalidRemoteConfig,
        {
          configVersion: data.configVersion,
          type: data.type,
          reason: FeatureAnalytics.getReason(data.error),
        },
      );
    } catch (e) {
      // ignore error
    }
  }

  sendFeatureFlagRecalculated(data: {
    configVersion: number,
    features: Record<string, { flag: boolean }>
  }): void {
    try {
      const features = {};
      forEach(data?.features || {}, (value, key) => {
        features[key] = value?.flag;
      });

      this.sendEvent(
        TelemetryEvents.FeatureFlagRecalculated,
        {
          configVersion: data.configVersion,
          features,
        },
      );
    } catch (e) {
      // ignore error
    }
  }
}
