export * from '../helpers/test';
import * as request from 'supertest';
import * as chai from 'chai';
import * as localDb from '../helpers/local-db';
import { constants } from '../helpers/constants';
import { getServer, getSocket } from '../helpers/server';
import { testEnv } from '../helpers/test';
import * as redis from '../helpers/redis';
import { initCloudDatabase } from '../helpers/cloud';

/**
 * Initialize dependencies
 */
export async function depsInit () {
  // create cloud subscription if needed
  if(constants.TEST_CLOUD_RTE) {
    await initCloudDatabase();
  }
  // initializing backend server
  deps.server = await getServer();

  // initializing Redis Test Environment
  deps.rte = await redis.initRTE();

  testEnv.rte = deps.rte.env;

  if (typeof deps.server === 'string') {
    testEnv.rte.serverType = 'docker';
  } else {
    testEnv.rte.serverType = 'local';
  }

  // initializing local database
  await localDb.initLocalDb(deps.rte, deps.server);
}

export const deps = {
  localDb,
  constants,
  request,
  expect: chai.expect,
  server: null,
  getSocket,
  rte: null,
  testEnv,
}
