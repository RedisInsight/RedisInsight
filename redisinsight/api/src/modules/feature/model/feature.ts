import { Expose } from 'class-transformer';

export class Feature {
  @Expose()
  name: string;

  @Expose()
  flag: boolean;
}
