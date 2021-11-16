import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { get } from 'lodash';
import * as Analytics from 'analytics-node';
import { AppAnalyticsEvents } from 'src/constants';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import config from 'src/utils/config';

export const NON_TRACKING_ANONYMOUS_ID = 'UNSET';
const ANALYTICS_CONFIG = config.get('analytics');

export interface ITelemetryEvent {
  event: string;
  eventData: Object;
  nonTracking: boolean;
}

@Injectable()
export class AnalyticsService {
  private anonymousId: string = NON_TRACKING_ANONYMOUS_ID;

  private analytics;

  constructor(
    @Inject('SETTINGS_PROVIDER')
    private settingsService: ISettingsProvider,
  ) {}

  public getAnonymousId(): string {
    return this.anonymousId;
  }

  @OnEvent(AppAnalyticsEvents.Initialize)
  public initialize(anonymousId: string) {
    this.anonymousId = anonymousId;
    this.analytics = new Analytics(ANALYTICS_CONFIG.writeKey);
  }

  @OnEvent(AppAnalyticsEvents.Track)
  async sendEvent(payload: ITelemetryEvent) {
    try {
      // The event is reported only if the user's permission is granted.
      // The anonymousId is also sent along with the event.
      //
      // The `nonTracking` argument can be set to True to mark an event that doesn't track the specific
      // user in any way. When `nonTracking` is True, the event is sent regardless of whether the user's permission
      // for analytics is granted or not.
      // If permissions not granted anonymousId includes "UNSET" value without any user identifiers.
      const { event, eventData, nonTracking } = payload;
      const isAnalyticsGranted = !!get(
        await this.settingsService.getSettings(),
        'agreements.analytics',
        false,
      );
      if (isAnalyticsGranted) {
        this.analytics.track({
          anonymousId: this.anonymousId,
          event,
          properties: {
            ...eventData,
          },
        });
      } else if (nonTracking) {
        this.analytics.track({
          anonymousId: NON_TRACKING_ANONYMOUS_ID,
          event,
          properties: {
            ...eventData,
          },
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }
}
