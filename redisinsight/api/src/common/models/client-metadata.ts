import { Session } from 'src/common/models/session';

export enum ClientContext {
  Common = 'Common',
  Browser = 'Browser',
  CLI = 'CLI',
  Workbench = 'Workbench',
}

export class ClientMetadata {
  session: Session;

  databaseId: string;

  context: ClientContext;

  uniqueId?: string;
}
