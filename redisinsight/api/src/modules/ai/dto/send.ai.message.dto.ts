import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined, IsEnum, IsNotEmpty, IsString,
} from 'class-validator';
import { AiDatabaseTools, AiGeneralTools } from '../models';

export class AiMessageDto {
  @ApiProperty({
    description: 'Message content',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class SendAiMessageDto extends AiMessageDto {
  @ApiProperty({
    description: 'Message tool',
    enum: AiGeneralTools,
  })
  @IsDefined()
  @IsEnum(AiGeneralTools)
  tool: AiGeneralTools;
}

export class SendAiDatabaseMessageDto extends AiMessageDto {
  @ApiProperty({
    description: 'Message tool',
    enum: AiDatabaseTools,
  })
  @IsDefined()
  @IsEnum(AiDatabaseTools)
  tool: AiDatabaseTools;
}
