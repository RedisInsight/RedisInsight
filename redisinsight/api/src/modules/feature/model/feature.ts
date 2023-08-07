import { Expose } from 'class-transformer';

export class Feature {
  @Expose()
  name: string;

  @Expose()
  flag: boolean;

  @Expose()
  strategy?: string;

  @Expose()
  data?: any;
}
