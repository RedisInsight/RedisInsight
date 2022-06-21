import config from 'src/utils/config';
import {
  keyBy, values, forEach, orderBy,
} from 'lodash';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getFile } from 'src/utils';
import { plainToClass } from 'class-transformer';
import { Validator } from 'class-validator';
import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import { NotificationEvents, NotificationType } from 'src/modules/notification/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationsDto } from 'src/modules/notification/dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

const NOTIFICATIONS_CONFIG = config.get('notifications');

@Injectable()
export class GlobalNotificationProvider implements OnModuleInit {
  private logger: Logger = new Logger('GlobalNotificationProvider');

  private validator = new Validator();

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repository: Repository<NotificationEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Initiate sync on startup
   */
  onModuleInit() {
    // async operation to not wait for it and not block user in case when no internet connection
    setInterval(() => {
      this.sync().catch();
    }, 5000);
  }

  async sync() {
    try {
      const remoteNotificationsDto = await this.getNotificationsFromRemote();

      await this.validatedNotifications(remoteNotificationsDto);

      const toInsert = keyBy(
        remoteNotificationsDto.notifications.map((notification) => new NotificationEntity({
          ...notification,
          type: NotificationType.Global,
          read: false,
        })),
        'timestamp',
      );

      const currentNotifications = keyBy(await this.repository
        .createQueryBuilder('n')
        .where({ type: NotificationType.Global })
        .select(['n.timestamp', 'n.read'])
        .getMany(),
      'timestamp');

      await this.repository
        .createQueryBuilder('n')
        .delete()
        .where({ type: NotificationType.Global })
        .execute();

      // process

      const newNotifications = [];

      forEach(toInsert, (notification) => {
        if (currentNotifications[notification.timestamp]) {
          toInsert[notification.timestamp].read = currentNotifications[notification.timestamp].read;
        } else {
          newNotifications.push(notification);
        }
      });

      await this.repository.insert(values(toInsert));

      this.eventEmitter.emit(NotificationEvents.NewNotifications, orderBy(
        newNotifications,
        ['timestamp'],
        'desc',
      ));
    } catch (e) {
      this.logger.error('Unable to sync notifications with remote', e);
      throw e;
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
      throw e;
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
      throw e;
    }
  }
}
