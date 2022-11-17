import { Agreements } from 'src/modules/settings/models/agreements';

export abstract class AgreementsRepository {
  abstract getOrCreate(id: string): Promise<Agreements>;
  abstract update(id: string, agreements: Agreements): Promise<Agreements>;
}
