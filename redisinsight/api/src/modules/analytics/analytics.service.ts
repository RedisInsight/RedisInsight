import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { get } from 'lodash';
import * as Analytics from 'analytics-node';
import { AppAnalyticsEvents } from 'src/constants';
import config from 'src/utils/config';
import { SettingsService } from 'src/modules/settings/settings.service';

export const NON_TRACKING_ANONYMOUS_ID = 'UNSET';
const ANALYTICS_CONFIG = config.get('analytics');

export interface ITelemetryEvent {
  event: string;
  eventData: Object;
  nonTracking: boolean;
}

export interface ITelemetryInitEvent {
  anonymousId: string;
  sessionId: number;
  appType: string;
}

@Injectable()
export class AnalyticsService {
  private anonymousId: string = NON_TRACKING_ANONYMOUS_ID;

  private sessionId: number = -1;

  private appType: string = 'unknown';

  private analytics;

  constructor(
    private settingsService: SettingsService,
  ) {}

  public getAnonymousId(): string {
    return this.anonymousId;
  }

  @OnEvent(AppAnalyticsEvents.Initialize)
  public initialize(payload: ITelemetryInitEvent) {
    const { anonymousId, sessionId, appType } = payload;
    this.sessionId = sessionId;
    this.anonymousId = anonymousId;
    this.appType = appType;
    this.analytics = new Analytics(ANALYTICS_CONFIG.writeKey, {
      flushInterval: ANALYTICS_CONFIG.flushInterval,
    });
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
        // todo: define how to fetch userId?
        await this.settingsService.getAppSettings('1'),
        'agreements.analytics',
        false,
      );
      if (isAnalyticsGranted || nonTracking) {
        this.analytics.track({
          anonymousId: this.anonymousId,
          integrations: { Amplitude: { session_id: this.sessionId } },
          event,
          properties: {
            ...eventData,
            buildType: this.appType,
          },
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }
}
