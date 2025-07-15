import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum AiDataGeneratorIntermediateStepType {
  TOOL = 'tool',
  TOOL_CALL = 'tool_call',
}

export class AiDataGeneratorIntermediateStep {
  @ApiProperty({
    enum: AiDataGeneratorIntermediateStepType,
  })
  @Expose()
  type: AiDataGeneratorIntermediateStepType;

  @ApiProperty({
    type: String,
  })
  @Expose()
  data: string = '';
} 