import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum BuildType {
  RedisStack = 'REDIS_STACK',
  Electron = 'ELECTRON',
  DockerOnPremise = 'DOCKER_ON_PREMISE',
}

export enum PackageType {
  AppImage = 'appimage',
}

export enum AppType {
  RedisStackWeb = 'REDIS_STACK_WEB',
  RedisStackApp = 'REDIS_STACK_ELECTRON',
  Electron = 'ELECTRON',
  Docker = 'DOCKER',
  Unknown = 'UNKNOWN',
}

export class Server {
  @ApiProperty({
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: Date,
  })
  @Expose()
  createDateTime: string;
}
