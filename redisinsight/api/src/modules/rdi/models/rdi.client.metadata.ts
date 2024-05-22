import { Session, SessionMetadata } from 'src/common/models/session';
import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class RdiClientMetadata {
  @IsNotEmpty()
  @Type(() => Session)
  sessionMetadata: SessionMetadata;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  id?: string;
}
