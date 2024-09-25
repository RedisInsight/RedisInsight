import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mockDatabase } from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { PubSubAnalyticsService } from './pub-sub.analytics.service';
import { SubscriptionType } from './constants';

const instanceId = mockDatabase.id;

const affected = 2;

describe('PubSubAnalyticsService', () => {
  let service: PubSubAnalyticsService;
  let sendEventMethod: jest.SpyInstance<PubSubAnalyticsService, unknown[]>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        PubSubAnalyticsService,
      ],
    }).compile();

    service = module.get<PubSubAnalyticsService>(PubSubAnalyticsService);
    sendEventMethod = jest.spyOn<PubSubAnalyticsService, any>(
      service,
      'sendEvent',
    );
  });

  describe('sendMessagePublishedEvent', () => {
    it('should emit sendMessagePublished event', () => {
      service.sendMessagePublishedEvent(
        instanceId,
        affected,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.PubSubMessagePublished,
        {
          databaseId: instanceId,
          clients: affected,
        },
      );
    });
  });

  describe('sendChannelSubscribeEvent', () => {
    it('should emit sendChannelSubscribe event for all channels', () => {
      service.sendChannelSubscribeEvent(
        instanceId,
        [{ channel: '*', type: SubscriptionType.Subscribe }],
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.PubSubChannelSubscribed,
        {
          databaseId: instanceId,
          allChannels: 'yes',
        },
      );
    });

    it('should emit sendChannelSubscribe event not for all channels', () => {
      service.sendChannelSubscribeEvent(
        instanceId,
        [{ channel: '1', type: SubscriptionType.Subscribe }],
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.PubSubChannelSubscribed,
        {
          databaseId: instanceId,
          allChannels: 'no',
        },
      );
    });
  });

  describe('sendChannelUnsubscribeEvent', () => {
    it('should emit sendChannelUnsubscribe event', () => {
      service.sendChannelUnsubscribeEvent(
        instanceId,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.PubSubChannelUnsubscribed,
        {
          databaseId: instanceId,
        },
      );
    });
  });
});
