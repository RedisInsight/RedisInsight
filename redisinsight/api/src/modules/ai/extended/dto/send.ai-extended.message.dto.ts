import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendAiExtendedMessageDto {
  @ApiProperty({
    description: 'Message content',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
