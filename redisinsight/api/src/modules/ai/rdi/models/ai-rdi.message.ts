import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Default } from 'src/common/decorators';
import { AiRdiIntermediateStep } from 'src/modules/ai/rdi/models/ai-rdi.intermediate-step';
import { RdiSocketEvents } from 'src/modules/ai/rdi/models/ai-rdi.common';

export enum AiRdiMessageType {
  HumanMessage = 'HumanMessage',
  AiMessage = 'AIMessage',
}

export class AiRdiMessage {
  @ApiProperty({
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    enum: RdiSocketEvents,
  })
  @Expose()
  @IsEnum(RdiSocketEvents)
  @IsNotEmpty()
  type: RdiSocketEvents;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
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
  @Type(() => AiRdiIntermediateStep)
  @Default([])
  steps?: AiRdiIntermediateStep[] = [];

  @ApiProperty({
    type: Date,
  })
  @Expose()
  createdAt: Date;
}
