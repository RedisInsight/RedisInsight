import { ApiProperty } from '@nestjs/swagger';

export class MessageBase<T> {
  @ApiProperty({ format: 'uuid', description: 'Identify a flow' })
  correlationId: string;

  @ApiProperty({ format: 'uuid', description: 'Identify a request' })
  messageId?: string;

  @ApiProperty({ description: 'Type of message' })
  messageType: string;

  @ApiProperty({ format: 'date-time' })
  timestamp: string;

  @ApiProperty({ format: 'X.Y.Z', description: 'Message Version' })
  version: string;

  @ApiProperty({ description: 'Message payload' })
  payload: T;
}

export class CreateCatReplyCommand extends MessageBase<any> {}

export class CreateCatReplySuccessCommandPayload {
  @ApiProperty({ format: 'uuid' })
  identifier: string;
}

export class CreateCatReplySuccessCommand extends MessageBase<CreateCatReplySuccessCommandPayload> {}
