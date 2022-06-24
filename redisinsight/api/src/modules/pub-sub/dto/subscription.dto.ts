import { SubscriptionType } from 'src/modules/pub-sub/constants';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class SubscriptionDto {
  @IsNotEmpty()
  @IsString()
  channel: string;

  @IsNotEmpty()
  @IsEnum(SubscriptionType)
  type: SubscriptionType;
}
