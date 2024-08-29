import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum AiIntermediateStepType {
  TOOL = 'tool',
  TOOL_CALL = 'tool_call',
}

export class AiIntermediateStep {
  @ApiProperty({
    enum: AiIntermediateStepType,
  })
  @Expose()
  type: AiIntermediateStepType;

  @ApiProperty({
    type: String,
  })
  @Expose()
  data: string = '';
}
