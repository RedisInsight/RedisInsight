import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { ShortCommandExecution } from 'src/modules/workbench/models/short-command-execution';

export abstract class CommandExecutionRepository {
  abstract createMany(commandExecutions: Partial<CommandExecution>[]): Promise<CommandExecution[]>;
  abstract getList(databaseId: string): Promise<ShortCommandExecution[]>;
  abstract getOne(databaseId: string, id: string): Promise<CommandExecution>;
  abstract delete(databaseId: string, id: string): Promise<void>;
  abstract deleteAll(databaseId: string): Promise<void>;
}
