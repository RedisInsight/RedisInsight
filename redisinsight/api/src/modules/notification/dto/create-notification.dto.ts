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
}
