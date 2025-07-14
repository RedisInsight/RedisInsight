import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum AiExtendedIntermediateStepType {
  TOOL = 'tool',
  TOOL_CALL = 'tool_call',
}

export class AiExtendedIntermediateStep {
  @ApiProperty({
    enum: AiExtendedIntermediateStepType,
  })
  @Expose()
  type: AiExtendedIntermediateStepType;

  @ApiProperty({
    type: String,
  })
  @Expose()
  data: string = '';
}
