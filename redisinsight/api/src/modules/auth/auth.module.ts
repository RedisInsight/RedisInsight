import { Module } from '@nestjs/common';
import config, { Config } from 'src/utils/config';
import { WindowAuthModule } from './window-auth/window-auth.module';
import { MicrosoftAuthModule } from './microsoft-auth/microsoft-azure-auth.module';
import { BuildType } from '../server/models/server';

const SERVER_CONFIG = config.get('server') as Config['server'];

@Module({})
export class AuthModule {
  static register() {
    const imports = [MicrosoftAuthModule];

    if (SERVER_CONFIG.buildType === BuildType.Electron) {
      imports.push(WindowAuthModule);
    }

    return {
      module: AuthModule,
      imports,
    };
  }
}
