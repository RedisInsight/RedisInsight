// todo: discuss. introduce userId here?
export class CommandExecution {
  id: string;

  databaseId: string;

  command: string;

  mode?: string;

  result: string;

  role?: string;

  nodeOptions?: string;

  encryption: string;

  createdAt: Date;
}
