import { Expose } from 'class-transformer';

export class Feature {
  @Expose()
  version: number;

  @Expose()
  name: string;

  @Expose()
  flag: boolean;
}
