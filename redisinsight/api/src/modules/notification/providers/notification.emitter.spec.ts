import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { MockType } from 'src/__mocks__';
import { SessionMetadata } from 'src/common/models';
import {
  NotificationServerEvents,
  NotificationType,
} from 'src/modules/notification/constants';
import {
  NotificationDto,
  NotificationsDto,
} from 'src/modules/notification/dto';
import { NotificationEmitter } from 'src/modules/notification/providers/notification.emitter';
import { NotificationRepository } from '../repositories/notification.repository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNotification1 = new NotificationDto({
  title: 'Title-1',
  body: 'Body-1',
  timestamp: 100,
  type: NotificationType.Global,
  read: false,
});

const mockNotification2 = new NotificationDto({
  title: 'Title-2',
  body: 'Body-2',
  timestamp: 200,
  type: NotificationType.Global,
  read: false,
});

const mockEventEmitter = {
  emit: jest.fn(),
};

const mockNotificationRepository: MockType<Partial<NotificationRepository>> = {
  getTotalUnread: jest.fn(),
};

const mockSessionMetadata: SessionMetadata = {
  sessionId: 'mockSessionId',
  userId: 'mockUserId',
};

describe('NotificationEmitter', () => {
  let service: NotificationEmitter;
  let emitter: MockType<EventEmitter2>;

  beforeEach(async () => {
    // jest.resetAllMocks();
    jest.mock('axios', () => mockedAxios);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationEmitter,
        EventEmitter2,
        {
          provide: EventEmitter2,
          useFactory: () => mockEventEmitter,
        },
        {
          provide: NotificationRepository,
          useFactory: () => mockNotificationRepository,
        },
      ],
    }).compile();

    service = await module.get(NotificationEmitter);
    emitter = await module.get(EventEmitter2);
    emitter.emit.mockReset();
  });

  describe('notification', () => {
    it('should return undefined if no notifications', async () => {
      await service.notification(mockSessionMetadata, []);
      expect(emitter.emit).toHaveBeenCalledTimes(0);
    });
    it('should should init and set interval only once', async () => {
      mockNotificationRepository.getTotalUnread.mockResolvedValueOnce(2);

      await service.notification(mockSessionMetadata, [
        mockNotification1,
        mockNotification2,
      ]);
      expect(emitter.emit).toHaveBeenCalledTimes(1);
      expect(emitter.emit).toHaveBeenCalledWith(
        NotificationServerEvents.Notification,
        new NotificationsDto({
          notifications: [mockNotification1, mockNotification2],
          totalUnread: 2,
        }),
      );
    });
    it('should log an error but not fail', async () => {
      mockNotificationRepository.getTotalUnread.mockRejectedValueOnce(
        new Error('some error'),
      );

      await service.notification(mockSessionMetadata, [mockNotification1]);

      expect(emitter.emit).toHaveBeenCalledTimes(0);
    });
  });
});
