import config from 'src/utils/config';
import {
  keyBy, values, forEach, orderBy,
} from 'lodash';
import {
  BadRequestException, Injectable, InternalServerErrorException, Logger,
} from '@nestjs/common';
import { getFile } from 'src/utils';
import { plainToClass } from 'class-transformer';
import { Validator } from 'class-validator';
import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import { NotificationEvents, NotificationType } from 'src/modules/notification/constants';
import { Notification } from 'src/modules/notification/models/notification';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNotificationsDto } from 'src/modules/notification/dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationRepository } from '../repositories/notification.repository';

const NOTIFICATIONS_CONFIG = config.get('notifications');

@Injectable()
export class GlobalNotificationProvider {
  private logger: Logger = new Logger('GlobalNotificationProvider');

  private validator = new Validator();

  private interval;

  constructor(
    private notificationRepository: NotificationRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  init() {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(() => {
      this.sync().catch();
    }, NOTIFICATIONS_CONFIG.syncInterval);

    this.sync().catch();
  }

  async sync() {
    try {
      const remoteNotificationsDto = await this.getNotificationsFromRemote();

      await this.validatedNotifications(remoteNotificationsDto);

      const toInsert = keyBy(
        remoteNotificationsDto.notifications.map((notification) => plainToClass(Notification, {
          ...notification,
          type: NotificationType.Global,
          read: false,
        })),
        'timestamp',
      );

      const currentNotifications = keyBy(await this.notificationRepository.getGlobalNotifications(),
      'timestamp');

      await this.notificationRepository.deleteGlobalNotifications();

      // process

      const newNotifications = [];

      forEach(toInsert, (notification) => {
        if (currentNotifications[notification.timestamp]) {
          toInsert[notification.timestamp].read = currentNotifications[notification.timestamp].read;
        } else {
          newNotifications.push(notification);
        }
      });

      await this.notificationRepository.insertNotifications(values(toInsert));

      this.eventEmitter.emit(NotificationEvents.NewNotifications, orderBy(
        newNotifications,
        ['timestamp'],
        'desc',
      ));
    } catch (e) {
      this.logger.error('Unable to sync notifications with remote', e);
    }
  }

  async validatedNotifications(dto: CreateNotificationsDto): Promise<void> {
    this.logger.debug('Validating notifications from remote');

    try {
      const notificationsDto: CreateNotificationsDto = plainToClass(CreateNotificationsDto, dto);
      await this.validator.validateOrReject(notificationsDto, {
        whitelist: true,
      });
    } catch (e) {
      this.logger.error(`Invalid notification(s) found. ${e.message}`, e);
      throw new BadRequestException(e);
    }
  }

  async getNotificationsFromRemote(): Promise<CreateNotificationsDto> {
    this.logger.debug('Getting notifications from remote');

    try {
      const buffer = await getFile(NOTIFICATIONS_CONFIG.updateUrl);
      const serializedString = buffer.toString();
      const json = JSON.parse(serializedString);
      return plainToClass(CreateNotificationsDto, json);
    } catch (e) {
      this.logger.error(`Unable to download or parse notifications json. ${e.message}`, e);
      throw new InternalServerErrorException('Unable to get and parse file from remote');
    }
  }
}
