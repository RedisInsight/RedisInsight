import {
  IsInt, IsNotEmpty, IsString,
} from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsInt()
  timestamp: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  constructor(dto: Partial<CreateNotificationDto>) {
    Object.assign(this, dto);
  }
}
