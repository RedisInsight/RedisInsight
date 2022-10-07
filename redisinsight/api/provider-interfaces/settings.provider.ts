import { Settings } from './models/settings';

export interface ISettingsProvider {
  get(userId: string): Promise<Settings>
  upsert(settings: Settings): Promise<Settings>
}
