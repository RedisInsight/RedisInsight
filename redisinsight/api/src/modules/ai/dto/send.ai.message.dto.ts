import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined, IsEnum, IsNotEmpty, IsString,
} from 'class-validator';
import { AiTools } from '../models';

export class SendAiMessageDto {
  @ApiProperty({
    description: 'Message content',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Message tool',
    enum: AiTools,
  })
  @IsDefined()
  @IsEnum(AiTools)
  tool: AiTools;
}
