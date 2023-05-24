import { FeaturesConfig } from 'src/modules/feature/model/features-config';

export abstract class FeaturesConfigRepository {
  abstract getOrCreate(): Promise<FeaturesConfig>;
  abstract update(config: any): Promise<FeaturesConfig>;
}
