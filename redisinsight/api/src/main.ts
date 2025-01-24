import { posix } from 'path';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { INestApplication, Logger, NestApplicationOptions } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { GlobalExceptionFilter } from 'src/exceptions/global-exception.filter';
import { get, Config } from 'src/utils';
import { migrateHomeFolder, removeOldFolders } from 'src/init-helper';
import { LogFileProvider } from 'src/modules/profiler/providers/log-file.provider';
import { WindowsAuthAdapter } from 'src/modules/auth/window-auth/adapters/window-auth.adapter';
import { AppLogger } from 'src/common/logger/app-logger';
import { CloudAuthModule } from 'src/modules/cloud/auth/cloud-auth.module';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';
import { AppModule } from './app.module';
import SWAGGER_CONFIG from '../config/swagger';
import LOGGER_CONFIG from '../config/logger';
import { createHttpOptions } from './utils/createHttpOptions';
import { SessionMetadataAdapter } from './modules/auth/session-metadata/adapters/session-metadata.adapter';

const serverConfig = get('server') as Config['server'];

interface IApp {
  app: INestApplication;
  gracefulShutdown: Function;
  cloudAuthService: CloudAuthService;
}

export default async function bootstrap(apiPort?: number): Promise<IApp> {
  if (serverConfig.migrateOldFolders) {
    (await migrateHomeFolder()) && (await removeOldFolders());
  }

  if (apiPort) {
    serverConfig.port = apiPort;
  }

  const logger = new AppLogger(LOGGER_CONFIG);

  const options: NestApplicationOptions = {
    logger,
  };

  if (serverConfig.tlsCert && serverConfig.tlsKey) {
    options.httpsOptions = await createHttpOptions(serverConfig);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, options);
  app.useGlobalFilters(new GlobalExceptionFilter(app.getHttpAdapter()));
  app.use(bodyParser.json({ limit: '512mb' }));
  app.use(bodyParser.urlencoded({ limit: '512mb', extended: true }));
  app.enableCors();

  if (process.env.RI_APP_TYPE !== 'electron' || process.env.NODE_ENV === 'development') {
    let prefix = serverConfig.globalPrefix;
    if (serverConfig.proxyPath) {
      prefix = posix.join(serverConfig.proxyPath, prefix);
    }

    app.setGlobalPrefix(prefix, { exclude: ['/'] });

    SwaggerModule.setup(
      serverConfig.docPrefix,
      app,
      SwaggerModule.createDocument(app, SWAGGER_CONFIG),
      {
        swaggerOptions: {
          docExpansion: 'none',
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
      },
    );
  } else {
    app.setGlobalPrefix(serverConfig.globalPrefix);
    app.useWebSocketAdapter(new WindowsAuthAdapter(app));
  }

  app.useWebSocketAdapter(new SessionMetadataAdapter(app));

  const logFileProvider = app.get(LogFileProvider);

  const { port, host } = serverConfig;

  await app.listen(port, host);

  const bootstrapLogger = new Logger('boostrap');
  bootstrapLogger.log(`Server is running on http(s)://${host}:${port}`);

  const gracefulShutdown = (signal) => {
    try {
      bootstrapLogger.log(`Signal ${signal} received. Shutting down...`);
      logFileProvider.onModuleDestroy();
    } catch (e) {
      // ignore errors if any
    }
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  const cloudAuthService = app.select(CloudAuthModule).get(CloudAuthService);

  return { app, gracefulShutdown, cloudAuthService };
}

if (serverConfig.autoBootstrap) {
  bootstrap();
}
