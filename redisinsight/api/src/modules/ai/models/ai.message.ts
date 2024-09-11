import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import { AiIntermediateStep } from 'src/modules/ai/models/ai.intermediate-step';
import { Default } from 'src/common/decorators';
import { AiTools } from './ai.common';

export enum AiMessageType {
  HumanMessage = 'HumanMessage',
  AiMessage = 'AIMessage',
}

export class AiMessage {
  @ApiProperty({
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    enum: AiMessageType,
  })
  @Expose()
  @IsEnum(AiMessageType)
  @IsNotEmpty()
  type: AiMessageType;

  @ApiProperty({
    enum: AiTools,
  })
  @Expose()
  @IsEnum(AiTools)
  @IsDefined()
  tool: typeof AiTools;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  @Expose()
  @IsString()
  databaseId: string;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
  content: string = '';

  @ApiProperty({
    type: String,
    isArray: true,
  })
  @Expose()
  @Type(() => AiIntermediateStep)
  @Default([])
  steps?: AiIntermediateStep[] = [];

  @ApiProperty({
    type: Date,
  })
  @Expose()
  createdAt: Date;
}
