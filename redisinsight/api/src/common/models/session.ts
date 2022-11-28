export interface ISession {
  userId: string;
  sessionId: string;
  uniqueId?: string;
}

export class Session implements ISession {
  userId: string;

  sessionId: string;

  uniqueId?: string;
}
