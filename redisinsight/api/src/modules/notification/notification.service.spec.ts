import { Test, TestingModule } from '@nestjs/testing';
import { mockRepository, MockType } from 'src/__mocks__';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import { Repository } from 'typeorm';
import { NotificationType } from 'src/modules/notification/constants';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { NotificationService } from 'src/modules/notification/notification.service';

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

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: MockType<Repository<NotificationEntity>>;

  beforeEach(async () => {
    jest.mock('axios', () => mockedAxios);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(NotificationEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = await module.get(NotificationService);
    repository = await module.get(
      getRepositoryToken(NotificationEntity),
    );
  });

  describe('getNotifications', () => {
    it('should return list of notifications', async () => {
      repository.createQueryBuilder().getMany.mockResolvedValueOnce([
        mockNotificationEntity3,
        mockNotificationEntity1,
      ]);

      repository.createQueryBuilder().getCount.mockResolvedValueOnce(2);

      const result = await service.getNotifications();

      expect(result).toEqual({
        totalUnread: 2,
        notifications: [
          mockNotificationEntity3,
          mockNotificationEntity1,
        ],
      });
    });
    it('should throw an error if any', async () => {
      repository.createQueryBuilder().getMany.mockRejectedValue(new Error('some error'));

      try {
        await service.getNotifications();
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('Unable to get notifications list');
      }
    });
  });

  describe('readNotifications', () => {
    it('should update all notifications', async () => {
      repository.createQueryBuilder().getCount.mockResolvedValueOnce(2);
      repository.createQueryBuilder().execute.mockResolvedValueOnce('ok');

      expect(await service.readNotifications({})).toEqual({
        totalUnread: 2,
        notifications: [],
      });
    });
    it('should throw an error if any', async () => {
      repository.createQueryBuilder().execute.mockRejectedValue(new Error('some error'));

      try {
        await service.readNotifications({ timestamp: 1, type: NotificationType.Global });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('Unable to "read" notification(s)');
      }
    });
  });
});
