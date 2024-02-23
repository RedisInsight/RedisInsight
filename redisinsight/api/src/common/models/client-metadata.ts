import { Session, SessionMetadata } from 'src/common/models/session';
import { Type } from 'class-transformer';
import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min,
} from 'class-validator';

export enum ClientContext {
  Common = 'Common',
  Browser = 'Browser',
  CLI = 'CLI',
  Workbench = 'Workbench',
  Profiler = 'Profiler',
}

export class ClientMetadata {
  @IsNotEmpty()
  @Type(() => Session)
  sessionMetadata: SessionMetadata;

  @IsNotEmpty()
  @IsString()
  databaseId: string;

  @IsNotEmpty()
  @IsEnum(ClientContext, {
    message: `context must be a valid enum value. Valid values: ${Object.values(
      ClientContext,
    )}.`,
  })
  context: ClientContext;

  @IsOptional()
  @IsString()
  uniqueId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(2147483647)
  db?: number;
}
