import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { WinstonModule } from 'nest-winston';
import { GlobalExceptionFilter } from 'src/exceptions/global-exception.filter';
import { get, Config } from 'src/utils';
import { migrateHomeFolder, removeGuidesFolder } from 'src/init-helper';
import { LogFileProvider } from 'src/modules/profiler/providers/log-file.provider';
import { WindowsAuthAdapter } from 'src/modules/auth/window-auth/adapters/window-auth.adapter';
import { AppModule } from './app.module';
import SWAGGER_CONFIG from '../config/swagger';
import LOGGER_CONFIG from '../config/logger';
import { createHttpOptions } from './utils/createHttpOptions';

const serverConfig = get('server') as Config['server'];

interface IApp {
  app: INestApplication;
  gracefulShutdown: Function;
}

export default async function bootstrap(apiPort?: number): Promise<IApp> {
  await migrateHomeFolder();
  await removeGuidesFolder();

  const { port, host } = serverConfig;
  const logger = WinstonModule.createLogger(LOGGER_CONFIG);

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
  app.setGlobalPrefix(serverConfig.globalPrefix);

  if (process.env.RI_APP_TYPE !== 'electron') {
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
    app.useWebSocketAdapter(new WindowsAuthAdapter(app));
  }

  const logFileProvider = app.get(LogFileProvider);

  await app.listen(apiPort || port, host);
  logger.log({
    message: `Server is running on http(s)://${host}:${port}`,
    context: 'bootstrap',
  });

  const gracefulShutdown = (signal) => {
    try {
      logger.log(`Signal ${signal} received. Shutting down...`);
      logFileProvider.onModuleDestroy();
    } catch (e) {
      // ignore errors if any
    }
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  return { app, gracefulShutdown };
}

if (process.env.RI_APP_TYPE !== 'electron') {
  bootstrap();
}
