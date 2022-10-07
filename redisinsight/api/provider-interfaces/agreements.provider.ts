import { Agreements } from './models/agreements';

export interface IAgreementsProvider {
  get(userId: string): Promise<Agreements>
  upsert(agreements: Agreements): Promise<Agreements>
}
