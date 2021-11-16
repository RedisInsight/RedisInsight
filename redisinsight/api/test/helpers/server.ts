import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as bodyParser from 'body-parser';
import { constants } from './constants';

/**
 * TEST_BE_SERVER - url to already running API that we want to test
 * When not defined We will up and run local server
 */
export let server = process.env.TEST_BE_SERVER;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Initiate server if needed (only once)
 */
export const getServer = async () => {
  try {
    const keytar = require('keytar');
    let keytarPassword = await keytar.getPassword('redisinsight', 'app');
    if (!keytarPassword) {
      await keytar.setPassword('redisinsight', 'app', constants.TEST_KEYTAR_PASSWORD);
    }
    else {
      constants.TEST_KEYTAR_PASSWORD = keytarPassword;
    }
  } catch (e) {
    constants.TEST_ENCRYPTION_STRATEGY = 'PLAIN';
  }

  if (!server) {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.use(bodyParser.json({ limit: '512mb' }));
    app.use(bodyParser.urlencoded({ limit: '512mb', extended: true }));

    await app.init();
    server = await app.getHttpServer();
  }

  return server;
}
