import { Settings } from 'src/modules/settings/models/settings';

export abstract class SettingsRepository {
  abstract getOrCreate(id: string): Promise<Settings>;
  abstract update(id: string, settings: Settings): Promise<Settings>;
}
