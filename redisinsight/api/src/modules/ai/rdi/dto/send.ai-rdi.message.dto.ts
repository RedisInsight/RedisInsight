import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Default } from 'src/common/decorators';
import { RdiSocketEvents } from '../models';

export class SendAiRdiMessageDto {
  @ApiProperty({
    enum: RdiSocketEvents,
  })
  @Expose()
  @IsEnum(RdiSocketEvents)
  @IsNotEmpty()
  @Default(RdiSocketEvents.RdiStream)
  type: RdiSocketEvents;

  @ApiProperty({
    description: 'Message content',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'RDI context, which is probably stringified JSON',
    type: String,
  })
  @IsString()
  rdiContext: string;
}
