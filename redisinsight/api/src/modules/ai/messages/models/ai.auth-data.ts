import { Expose } from 'class-transformer';

export class AiAuthData {
  @Expose()
  sessionId: string;

  @Expose()
  csrf: string;

  @Expose()
  accountId: string;
}
