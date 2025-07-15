import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Default } from 'src/common/decorators';
import { AiDataGeneratorIntermediateStep } from 'src/modules/ai/data-generator/models/ai-data-generator.intermediate-step';

export enum AiDataGeneratorMessageType {
  HumanMessage = 'HumanMessage',
  AiMessage = 'AIMessage',
}

export class AiDataGeneratorMessage {
  @ApiProperty({
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    enum: AiDataGeneratorMessageType,
  })
  @Expose()
  @IsEnum(AiDataGeneratorMessageType)
  @IsNotEmpty()
  type: AiDataGeneratorMessageType;

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
  @Type(() => AiDataGeneratorIntermediateStep)
  @Default([])
  steps?: AiDataGeneratorIntermediateStep[] = [];

  @ApiProperty({
    type: Date,
  })
  @Expose()
  createdAt: Date;
} 