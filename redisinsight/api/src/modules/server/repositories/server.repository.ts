import { Server } from 'src/modules/server/models/server';

export abstract class ServerRepository {
  /**
   * Fast check if server model exists by id
   * No need to retrieve any fields should return boolean only
   * @param id
   * @return boolean
   */
  abstract exists(id: string): Promise<boolean>;

  /**
   * Get Server model or create and return new one
   * @param id
   */
  abstract getOrCreate(id: string): Promise<Server>;
}
