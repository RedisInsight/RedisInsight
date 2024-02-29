import { isString } from 'lodash';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpException } from '@nestjs/common';
import { AppAnalyticsEvents } from 'src/constants';

export abstract class TelemetryBaseService {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
  ) {}

  protected sendEvent(event: string, eventData: object = {}): void {
    try {
      this.eventEmitter.emit(AppAnalyticsEvents.Track, {
        event,
        eventData: {
          ...eventData,
          command: isString(eventData['command']) ? eventData['command'].toUpperCase() : eventData['command'],
        },
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  protected sendFailedEvent(event: string, exception: HttpException, eventData: object = {}): void {
    try {
      this.eventEmitter.emit(AppAnalyticsEvents.Track, {
        event,
        eventData: {
          error: exception.getResponse?.()['error'] || exception.message,
          ...eventData,
          command: isString(eventData['command']) ? eventData['command'].toUpperCase() : eventData['command'],
        },
      });
    } catch (e) {
      // continue regardless of error
    }
  }
}
