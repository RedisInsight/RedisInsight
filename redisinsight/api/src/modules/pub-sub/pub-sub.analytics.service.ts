import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { some } from 'lodash';
import { DEFAULT_MATCH, TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { RedisError, ReplyError } from 'src/models';
import { SubscriptionDto } from './dto';

export interface IExecResult {
  response: any;
  status: CommandExecutionStatus;
  error?: RedisError | ReplyError | Error,
}

@Injectable()
export class PubSubAnalyticsService extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendMessagePublishedEvent(databaseId: string, affected: number): void {
    try {
      this.sendEvent(
        TelemetryEvents.PubSubMessagePublished,
        {
          databaseId,
          clients: affected,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendChannelSubscribeEvent(databaseId: string, subs: SubscriptionDto[]): void {
    try {
      this.sendEvent(
        TelemetryEvents.PubSubChannelSubscribed,
        {
          databaseId,
          allChannels: some(subs, { channel: DEFAULT_MATCH }) ? 'yes' : 'no',
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendChannelUnsubscribeEvent(databaseId: string): void {
    try {
      this.sendEvent(
        TelemetryEvents.PubSubChannelUnsubscribed,
        {
          databaseId,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }
}
