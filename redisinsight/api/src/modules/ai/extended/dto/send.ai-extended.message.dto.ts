import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DataSocketEvents } from 'src/modules/ai/extended/models';
import { Expose } from 'class-transformer';
import { Default } from 'src/common/decorators';

export class SendAiExtendedMessageDto {
  @ApiProperty({
    enum: DataSocketEvents,
  })
  @Expose()
  @IsEnum(DataSocketEvents)
  @IsNotEmpty()
  @Default(DataSocketEvents.DataStream)
  type: DataSocketEvents;

  @ApiProperty({
    description: 'Message content',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
