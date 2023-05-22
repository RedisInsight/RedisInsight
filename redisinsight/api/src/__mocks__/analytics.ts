import { EventEmitter2 } from '@nestjs/event-emitter';
import { BulkActionsAnalyticsService } from 'src/modules/bulk-actions/bulk-actions-analytics.service';

const mockEmitter = new EventEmitter2();

class AnalyticsService extends BulkActionsAnalyticsService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }
}

export const mockInstancesAnalyticsService = () => ({
  sendInstanceListReceivedEvent: jest.fn(),
  sendInstanceAddedEvent: jest.fn(),
  sendInstanceAddFailedEvent: jest.fn(),
  sendInstanceEditedEvent: jest.fn(),
  sendInstanceDeletedEvent: jest.fn(),
  sendConnectionFailedEvent: jest.fn(),
});

export const mockCliAnalyticsService = () => ({
  sendClientCreatedEvent: jest.fn(),
  sendClientCreationFailedEvent: jest.fn(),
  sendClientDeletedEvent: jest.fn(),
  sendClientRecreatedEvent: jest.fn(),
  sendCommandExecutedEvent: jest.fn(),
  sendCommandErrorEvent: jest.fn(),
  sendClusterCommandExecutedEvent: jest.fn(),
  sendConnectionErrorEvent: jest.fn(),
});

export const mockWorkbenchAnalyticsService = () => ({
  sendCommandExecutedEvents: jest.fn(),
  sendCommandExecutedEvent: jest.fn(),
  sendCommandDeletedEvent: jest.fn(),
});

export const mockSettingsAnalyticsService = () => ({
  sendAnalyticsAgreementChange: jest.fn(),
  sendSettingsUpdatedEvent: jest.fn(),
});

export const mockBulActionsAnalyticsService = new AnalyticsService(mockEmitter);

export const mockPubSubAnalyticsService = () => ({
  sendMessagePublishedEvent: jest.fn(),
  sendChannelSubscribeEvent: jest.fn(),
  sendChannelUnsubscribeEvent: jest.fn(),
});
