import { GetServerInfoResponse } from 'src/dto/server.dto';

export enum BuildType {
  RedisStack = 'REDIS_STACK',
  Electron = 'ELECTRON',
  DockerOnPremise = 'DOCKER_ON_PREMISE',
}

export interface IServerProvider {
  getInfo(): Promise<GetServerInfoResponse>;
}
