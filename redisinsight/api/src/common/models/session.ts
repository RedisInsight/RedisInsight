import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export interface ISession {
  userId: string;
  sessionId: string;
  uniqueId?: string;
}

export class Session implements ISession {
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
