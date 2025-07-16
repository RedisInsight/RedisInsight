import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum AiRdiIntermediateStepType {
  TOOL = 'tool',
  TOOL_CALL = 'tool_call',
}

export class AiRdiIntermediateStep {
  @ApiProperty({
    enum: AiRdiIntermediateStepType,
  })
  @Expose()
  type: AiRdiIntermediateStepType;

  @ApiProperty({
    type: String,
  })
  @Expose()
  data: string = '';
}
