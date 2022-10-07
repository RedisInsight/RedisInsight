import { Server } from './models/server';

export interface IServerRepository {
  get(userId: string): Promise<Server>
  upsert(server: Server): Promise<Server>
}
