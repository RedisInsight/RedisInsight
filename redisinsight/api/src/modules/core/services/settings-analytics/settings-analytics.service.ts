import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  differenceWith,
  isEqual,
  has,
} from 'lodash';
import { AppAnalyticsEvents, TelemetryEvents } from 'src/constants';
import { getRangeForNumber, getIsPipelineEnable, SCAN_THRESHOLD_BREAKPOINTS } from 'src/utils';
import { GetAppSettingsResponse } from 'src/dto/settings.dto';
import { TelemetryBaseService } from 'src/modules/shared/services/base/telemetry.base.service';

@Injectable()
export class SettingsAnalyticsService extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  // eslint-disable-next-line class-methods-use-this,max-len
  sendSettingsUpdatedEvent(
    newSettings: GetAppSettingsResponse,
    oldSettings: GetAppSettingsResponse,
  ): void {
    try {
      const dif = Object.fromEntries(
        differenceWith(Object.entries(newSettings), Object.entries(oldSettings), isEqual),
      );
      if (has(dif, 'scanThreshold')) {
        this.sendScanThresholdChanged(dif.scanThreshold, oldSettings.scanThreshold);
      }
      if (has(dif, 'batchSize')) {
        this.sendWorkbenchPipelineChanged(dif.batchSize, oldSettings.batchSize);
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  // Detect that analytics agreement was first established or changed
  sendAnalyticsAgreementChange(
    newAgreements: Map<string, boolean>,
    oldAgreements: Map<string, boolean> = new Map(),
  ) {
    try {
      const newPermission = newAgreements.get('analytics');
      const oldPermission = oldAgreements.get('analytics');
      if (oldPermission !== newPermission) {
        this.eventEmitter.emit(AppAnalyticsEvents.Track, {
          event: TelemetryEvents.AnalyticsPermission,
          eventData: {
            state: newPermission ? 'enabled' : 'disabled',
          },
          nonTracking: true,
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  private sendScanThresholdChanged(currentValue: number, previousValue: number): void {
    this.sendEvent(
      TelemetryEvents.SettingsScanThresholdChanged,
      {
        currentValue,
        currentValueRange: getRangeForNumber(currentValue, SCAN_THRESHOLD_BREAKPOINTS),
        previousValue,
        previousValueRange: getRangeForNumber(previousValue, SCAN_THRESHOLD_BREAKPOINTS),
      },
    );
  }

  private sendWorkbenchPipelineChanged(newValue: number, currentValue: number): void {
    this.sendEvent(
      TelemetryEvents.SettingsWorkbenchPipelineChanged,
      {
        newValue: getIsPipelineEnable(newValue),
        newValueSize: newValue,
        currentValue: getIsPipelineEnable(currentValue),
        currentValueSize: currentValue,
      },
    );
  }
}
