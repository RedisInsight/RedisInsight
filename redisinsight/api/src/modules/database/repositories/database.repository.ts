import { Database } from 'src/modules/database/models/database';

export abstract class DatabaseRepository {
  /**
   * Fast check if database exists by id
   * No need to retrieve any fields should return boolean only
   * @param id
   * @return boolean
   */
  abstract exists(id: string): Promise<boolean>;

  /**
   * Get single database by id with all fields
   * @param id
   * @param ignoreEncryptionErrors
   * @param omitFields
   * @return Database
   */
  abstract get(id: string, ignoreEncryptionErrors?: boolean, omitFields?: string[]): Promise<Database>;

  /**
   * List of databases (limited fields only)
   * Fields: ['id', 'name', 'host', 'port', 'db', 'connectionType', 'modules', 'lastConnection]
   * @return Database[]
   */
  abstract list(): Promise<Database[]>;

  /**
   * Create database
   * @param database
   * @param uniqueCheck
   */
  abstract create(database: Database, uniqueCheck: boolean): Promise<Database>;

  /**
   * Update database with new data
   * @param id
   * @param database
   */
  abstract update(id: string, database: Partial<Database>): Promise<Database>;

  /**
   * Delete database by id
   * @param id
   */
  abstract delete(id: string): Promise<void>;
}
