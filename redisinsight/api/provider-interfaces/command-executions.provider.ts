import { CommandExecution } from './models/command-execution';

// todo: discuss. introduce userId here?
export interface ICommandExecutionsProvider {
  createMany(commandExecutions: CommandExecution[]): Promise<CommandExecution[]>
  /**
   * orderBy('createdAt', 'DESC')
   */
  cleanupDatabaseHistory(databaseId: string, offset: number): Promise<void>
  /**
   * orderBy('e.createdAt', 'DESC')
   * fields: ['e.id', 'e.command', 'e.databaseId', 'e.createdAt', 'e.encryption', 'e.role', 'e.nodeOptions', 'e.mode']
   */
  get(id: string, databaseId: string): Promise<CommandExecution>
  delete(id: string, databaseId: string): Promise<void>
}
