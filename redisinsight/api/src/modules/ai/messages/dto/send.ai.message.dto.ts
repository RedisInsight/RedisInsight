import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty, IsString,
} from 'class-validator';
import { Default } from 'src/common/decorators';
import { AiTool } from '../models';

export class AiMessageDto {
  @ApiProperty({
    description: 'Message content',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'bot type',
    enum: AiTool,
  })
  @IsEnum(AiTool)
  @Default(AiTool.General)
  tool: AiTool;
}
