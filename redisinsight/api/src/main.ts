import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { NestApplicationOptions } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import SWAGGER_CONFIG from '../config/swagger';
import LOGGER_CONFIG from '../config/logger';
import config from './utils/config';

export default async function bootstrap() {
  const serverConfig = config.get('server');
  const port = process.env.API_PORT || serverConfig.port;
  const logger = WinstonModule.createLogger(LOGGER_CONFIG);

  const options: NestApplicationOptions = {};
  if (serverConfig.tls && serverConfig.tlsCert && serverConfig.tlsKey) {
    options.httpsOptions = {
      key: JSON.parse(`"${serverConfig.tlsKey}"`),
      cert: JSON.parse(`"${serverConfig.tlsCert}"`),
    };
  }

  const app = await NestFactory.create(AppModule, options);

  app.use(bodyParser.json({ limit: '512mb' }));
  app.use(bodyParser.urlencoded({ limit: '512mb', extended: true }));
  app.enableCors();
  app.setGlobalPrefix(serverConfig.globalPrefix);
  app.useLogger(logger);

  if (process.env.APP_ENV !== 'electron') {
    SwaggerModule.setup(
      serverConfig.docPrefix,
      app,
      SwaggerModule.createDocument(app, SWAGGER_CONFIG),
    );
  }

  await app.listen(port);
  logger.log({
    message: `Server is running on http(s)://localhost:${port}`,
    context: 'bootstrap',
  });

  process.on('SIGTERM', () => {
    logger.log('SIGTERM command received. Shutting down...');
    process.exit(0);
  });
}

if (process.env.APP_ENV !== 'electron') {
  bootstrap();
}
