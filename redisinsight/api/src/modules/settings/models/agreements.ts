import { Expose } from 'class-transformer';

export class Agreements {
  @Expose()
  id: string;

  @Expose()
  version: string;

  @Expose()
  data: Record<string, boolean>;
}
