import { BrowserHistoryMode } from 'src/common/constants';

export class BrowserHistory {

  public constructor(init?: Partial<BrowserHistory>) {
    Object.assign(this, init);
  }

  public id: string;
  public databaseId: string;

  // TODO: I'm unsure how to handle this, another model type that mimics the typeorm entity?
  // database: DatabaseEntity;

  public filter: string;
  public mode?: string = BrowserHistoryMode.Pattern;
  public encryption: string;
  public createdAt: Date;
}
