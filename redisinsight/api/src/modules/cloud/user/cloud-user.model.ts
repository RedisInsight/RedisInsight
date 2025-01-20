import { Expose } from 'class-transformer';

export class CloudUser {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  currentAccountId?: string;

  @Expose()
  currentAccountName?: string;

  @Expose()
  data?: Record<string, any>;
}
