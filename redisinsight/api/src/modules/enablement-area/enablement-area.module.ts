import { join } from 'path';
import { Module } from '@nestjs/common';
import { EnablementAreaProvider } from 'src/modules/enablement-area/enablement-area.provider';
import { ServeStaticModule } from '@nestjs/serve-static';
import config from 'src/utils/config';

const SERVER_CONFIG = config.get('server');
const PATH_CONFIG = config.get('dir_path');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      serveRoot: SERVER_CONFIG.enablementAreaUri,
      rootPath: join(PATH_CONFIG.enablementArea),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
  ],
  providers: [EnablementAreaProvider],
})
export class EnablementAreaModule {}
