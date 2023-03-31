import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import config from 'src/utils/config';
import { AutoUpdatedStaticsProvider } from './providers/auto-updated-statics.provider';

const SERVER_CONFIG = config.get('server');
const PATH_CONFIG = config.get('dir_path');
const GUIDES_CONFIG = config.get('guides');
const TUTORIALS_CONFIG = config.get('tutorials');

const CONTENT_CONFIG = config.get('content');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.guidesUri,
      rootPath: join(PATH_CONFIG.guides),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.tutorialsUri,
      rootPath: join(PATH_CONFIG.tutorials),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.customTutorialsUri,
      rootPath: join(PATH_CONFIG.customTutorials),
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
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.defaultPluginsUri,
      rootPath: join(PATH_CONFIG.defaultPlugins),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.customPluginsUri,
      rootPath: join(PATH_CONFIG.customPlugins),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.pluginsAssetsUri,
      rootPath: join(PATH_CONFIG.pluginsAssets),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
  ],
  providers: [
    {
      provide: 'GuidesProvider',
      useFactory: () => new AutoUpdatedStaticsProvider({
        name: 'GuidesProvider',
        destinationPath: PATH_CONFIG.guides,
        defaultSourcePath: PATH_CONFIG.defaultGuides,
        ...GUIDES_CONFIG,
      }),
    },
    {
      provide: 'TutorialsProvider',
      useFactory: () => new AutoUpdatedStaticsProvider({
        name: 'TutorialsProvider',
        destinationPath: PATH_CONFIG.tutorials,
        defaultSourcePath: PATH_CONFIG.defaultTutorials,
        ...TUTORIALS_CONFIG,
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
