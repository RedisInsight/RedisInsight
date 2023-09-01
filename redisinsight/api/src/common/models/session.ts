import {
  IsNotEmpty, IsObject, IsOptional, IsString,
} from 'class-validator';

export interface ISessionMetadata {
  userId: string;
  sessionId: string;
  uniqueId?: string;
}

export class SessionMetadata implements ISessionMetadata {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  uniqueId?: string;
}

export class Session {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any> = {};
}
