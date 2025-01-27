import {
  IsNotEmpty, IsObject, IsOptional, IsString,
} from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';

export interface ISessionMetadata {
  userId: string;
  sessionId: string;
  uniqueId?: string;
}

export class SessionMetadata implements ISessionMetadata {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsObject()
  data?: Record<string, any> = {};

  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  uniqueId?: string;

  @IsOptional()
  @IsString()
  correlationId?: string;

  /**
   * Validates session metadata required properties to be defined
   * Must be used in all the places that works with clients
   * @param sessionMetadata
   */
  static validate(sessionMetadata: SessionMetadata) {
    if (
      !sessionMetadata?.sessionId
      || !sessionMetadata?.userId
    ) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_SESSION_METADATA);
    }
  }
}

export class Session {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any> = {};
}
