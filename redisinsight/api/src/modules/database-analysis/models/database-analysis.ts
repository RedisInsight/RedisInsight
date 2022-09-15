import { TopNsp } from 'src/modules/database-analysis/models/top-nsp';

export class DatabaseAnalysis {
  id: string;

  databaseId: string;

  topKeysNsp: TopNsp;

  topMemoryNsp: TopNsp;
}
