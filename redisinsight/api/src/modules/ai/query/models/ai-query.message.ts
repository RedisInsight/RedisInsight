import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum AiQueryMessageType {
  HumanMessage = 'HumanMessage',
  AiMessage = 'AIMessage',
}

export class AiQueryMessage {
  @ApiProperty({
    enum: AiQueryMessageType,
  })
  @Expose()
  type: AiQueryMessageType;

  @ApiProperty({
    type: String,
  })
  @Expose()
  content: string;
}
