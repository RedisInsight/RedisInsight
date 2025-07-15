import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendAiDataGeneratorMessageDto {
  @ApiProperty({
    description: 'Message content',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content: string;
} 