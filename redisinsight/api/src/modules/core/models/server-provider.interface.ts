import { GetServerInfoResponse } from 'src/dto/server.dto';

export interface IServerProvider {
  getInfo(): Promise<GetServerInfoResponse>;
}
