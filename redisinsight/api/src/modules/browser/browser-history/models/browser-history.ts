import { BrowserHistoryMode } from 'src/common/constants';
import { DataAsJsonString } from 'src/common/decorators';

export class BrowserHistory {

  public constructor(init?: Partial<BrowserHistory>) {
    Object.assign(this, init);
  }

  public id: string;
  public databaseId: string;

  // TODO: I'm unsure how to handle this, another model type that mimics the typeorm entity?
  // database: DatabaseEntity;

  @DataAsJsonString()
  public filter: string;

  public mode?: string = BrowserHistoryMode.Pattern;
  public encryption: string;
  public createdAt: Date;
}
