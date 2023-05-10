import { Expose } from 'class-transformer';

export class FeaturesConfig {
  @Expose()
  controlGroup: number;

  @Expose()
  config: any;
}
