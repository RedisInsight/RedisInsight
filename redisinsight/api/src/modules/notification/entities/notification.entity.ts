import {
  Column, Entity, PrimaryColumn,
} from 'typeorm';
import { NotificationType } from 'src/modules/notification/constants';

@Entity('notification')
export class NotificationEntity {
  @PrimaryColumn()
  type: NotificationType;

  @PrimaryColumn()
  timestamp: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, type: 'text' })
  body: string;

  @Column({ nullable: false, default: false })
  read?: boolean = false;

  constructor(entity: Partial<NotificationEntity>) {
    Object.assign(this, entity);
  }
}
