import { Database } from './models/database';

export interface IDatabaseProvider {
  get(id: string): Promise<Database>
  exists(id: string): Promise<boolean>
  // currently all fields in the future only needed for list view
  getAll(): Promise<Database>
  create(database: Database): Promise<Database>
  update(id: string, database: Database): Promise<Database>
  delete(id: string): Promise<void>
  deleteMany(ids: string[]): Promise<string[]> // array of affected ids. could be used instead of delete(id: string)
}
