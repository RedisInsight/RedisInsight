import { Feature } from 'src/modules/feature/model/feature';

export abstract class FeatureRepository {
  abstract get(name: string): Promise<Feature>;
  abstract upsert(feature: Feature): Promise<Feature>;
  abstract list(): Promise<Feature[]>;
  abstract delete(name: string): Promise<void>;
}
