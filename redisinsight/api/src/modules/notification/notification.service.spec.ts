import { Test, TestingModule } from '@nestjs/testing';
import { MockType } from 'src/__mocks__';

import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import { NotificationType } from 'src/modules/notification/constants';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { NotificationService } from 'src/modules/notification/notification.service';
import { SessionMetadata } from 'src/common/models';
import { NotificationRepository } from './repositories/notification.repository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNotification1 = {
  title: 'Title-1',
  body: 'Body-1',
  category: 'Release',
  categoryColor: '#b432ea',
  timestamp: 100,
};

const mockNotification3 = {
  title: 'Title-3',
  body: 'Body-3',
  timestamp: 300,
};

const mockNotificationEntity1 = new NotificationEntity({
  ...mockNotification1,
  type: NotificationType.Global,
  read: true,
});

const mockNotificationEntity3 = new NotificationEntity({
  ...mockNotification3,
  type: NotificationType.Global,
  read: false,
});

const mockNotificationRepository: MockType<Partial<NotificationRepository>> = {
  getNotifications: jest.fn(),
  readNotifications: jest.fn(),
};

const mockSessionData: SessionMetadata = {
  sessionId: 'mockSessionId',
  userId: 'mockUserId',
};

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    jest.mock('axios', () => mockedAxios);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useFactory: () => mockNotificationRepository,
        },
      ],
    }).compile();

    service = await module.get(NotificationService);
  });

  describe('getNotifications', () => {
    it('should return list of notifications', async () => {
      mockNotificationRepository.getNotifications.mockReturnValueOnce({
        notifications: [mockNotificationEntity3, mockNotificationEntity1],
        totalUnread: 2,
      });

      const result = await service.getNotifications(mockSessionData);

      expect(result).toEqual({
        totalUnread: 2,
        notifications: [
          mockNotificationEntity3,
          mockNotificationEntity1,
        ],
      });
    });
    it('should throw an error if any', async () => {
      mockNotificationRepository.getNotifications.mockRejectedValue(new Error('some error'));

      try {
        await service.getNotifications(mockSessionData);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('Unable to get notifications list');
      }
    });
  });

  describe('readNotifications', () => {
    it('should update all notifications', async () => {
      mockNotificationRepository.readNotifications.mockReturnValueOnce({
        notifications: [],
        totalUnread: 2,
      });

      expect(await service.readNotifications(mockSessionData, {})).toEqual({
        totalUnread: 2,
        notifications: [],
      });
    });
    it('should throw an error if any', async () => {
      mockNotificationRepository.readNotifications.mockRejectedValue(new Error('some error'));

      try {
        await service.readNotifications(mockSessionData, { timestamp: 1, type: NotificationType.Global });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('Unable to "read" notification(s)');
      }
    });
  });
});
