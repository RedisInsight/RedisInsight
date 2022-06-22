import { GetServerInfoResponse } from 'src/dto/server.dto';

export enum BuildType {
  RedisStack = 'REDIS_STACK',
  Electron = 'ELECTRON',
  DockerOnPremise = 'DOCKER_ON_PREMISE',
}

export enum AppType {
  RedisStackWeb = 'REDIS_STACK_WEB',
  RedisStackApp = 'REDIS_STACK_ELECTRON',
  Electron = 'ELECTRON',
  Docker = 'DOCKER',
  Unknown = 'UNKNOWN',
}

export interface IServerProvider {
  getInfo(): Promise<GetServerInfoResponse>;
}
