import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { WinstonModule } from 'nest-winston';
import { GlobalExceptionFilter } from 'src/exceptions/global-exception.filter';
import { get } from 'src/utils';
import { migrateHomeFolder } from 'src/init-helper';
import { LogFileProvider } from 'src/modules/profiler/providers/log-file.provider';
import { AppModule } from './app.module';
import SWAGGER_CONFIG from '../config/swagger';
import LOGGER_CONFIG from '../config/logger';

const serverConfig = get('server');

interface IApp {
  app: INestApplication
  gracefulShutdown: Function
}

export default async function bootstrap(): Promise<IApp> {
  await migrateHomeFolder();

  const port = process.env.API_PORT || serverConfig.port;
  const logger = WinstonModule.createLogger(LOGGER_CONFIG);

  const options: NestApplicationOptions = {
    logger,
  };

  if (serverConfig.tls && serverConfig.tlsCert && serverConfig.tlsKey) {
    options.httpsOptions = {
      key: JSON.parse(`"${serverConfig.tlsKey}"`),
      cert: JSON.parse(`"${serverConfig.tlsCert}"`),
    };
  }

  const app = await NestFactory.create(AppModule, options);
  app.useGlobalFilters(new GlobalExceptionFilter(app.getHttpAdapter()));
  app.use(bodyParser.json({ limit: '512mb' }));
  app.use(bodyParser.urlencoded({ limit: '512mb', extended: true }));
  app.enableCors();
  app.setGlobalPrefix(serverConfig.globalPrefix);

  if (process.env.APP_ENV !== 'electron') {
    SwaggerModule.setup(
      serverConfig.docPrefix,
      app,
      SwaggerModule.createDocument(app, SWAGGER_CONFIG),
    );
  }

  const logFileProvider = app.get(LogFileProvider);

  await app.listen(port, serverConfig.listenInterface);
  logger.log({
    message: `Server is running on http(s)://localhost:${port}`,
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

if (process.env.APP_ENV !== 'electron') {
  bootstrap();
}
