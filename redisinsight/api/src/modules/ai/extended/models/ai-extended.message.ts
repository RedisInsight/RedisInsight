import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Default } from 'src/common/decorators';
import { AiExtendedIntermediateStep } from 'src/modules/ai/extended/models/ai-extended.intermediate-step';
import { DataSocketEvents } from 'src/modules/ai/extended/models/ai-extended.common';

export enum AiExtendedMessageType {
  HumanMessage = 'HumanMessage',
  AiMessage = 'AIMessage',
}

export class AiExtendedMessage {
  @ApiProperty({
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    enum: DataSocketEvents,
  })
  @Expose()
  @IsEnum(DataSocketEvents)
  @IsNotEmpty()
  type: DataSocketEvents;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  databaseId: string;

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
  @Type(() => AiExtendedIntermediateStep)
  @Default([])
  steps?: AiExtendedIntermediateStep[] = [];

  @ApiProperty({
    type: Date,
  })
  @Expose()
  createdAt: Date;
}
