import {
  IsEnum,
  IsInt, NotEquals, ValidateIf,
} from 'class-validator';
import { NotificationType } from 'src/modules/notification/constants';

export class ReadNotificationsDto {
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  timestamp?: number;

  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsEnum(NotificationType)
  type?: NotificationType;

  constructor(dto: Partial<ReadNotificationsDto>) {
    Object.assign(this, dto);
  }
}
