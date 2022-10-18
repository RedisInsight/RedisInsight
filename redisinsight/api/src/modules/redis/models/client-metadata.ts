import { AppTool } from 'src/models';

export class ClientMetadata {
  databaseId: string;

  userId?: string;

  sessionId?: string;

  uuid?: string;

  namespace: AppTool = AppTool.Common;
}
