import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import config from 'src/utils/config';
import { AutoUpdatedStaticsProvider } from './providers/auto-updated-statics.provider';

const SERVER_CONFIG = config.get('server');
const PATH_CONFIG = config.get('dir_path');
const ENABLEMENT_AREA_CONFIG = config.get('enablementArea');
const CONTENT_CONFIG = config.get('content');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.enablementAreaUri,
      rootPath: join(PATH_CONFIG.enablementArea),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.contentUri,
      rootPath: join(PATH_CONFIG.content),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
  ],
  providers: [
    {
      provide: 'EnablementAreaProvider',
      useFactory: () => new AutoUpdatedStaticsProvider({
        name: 'EnablementAreaProvider',
        destinationPath: PATH_CONFIG.enablementArea,
        defaultSourcePath: PATH_CONFIG.defaultEnablementArea,
        ...ENABLEMENT_AREA_CONFIG,
      }),
    },
    {
      provide: 'ContentProvider',
      useFactory: () => new AutoUpdatedStaticsProvider({
        name: 'ContentProvider',
        destinationPath: PATH_CONFIG.content,
        defaultSourcePath: PATH_CONFIG.defaultContent,
        ...CONTENT_CONFIG,
      }),
    },
  ],
})
export class StaticsManagementModule {}
