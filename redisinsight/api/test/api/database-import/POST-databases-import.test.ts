import {
  Joi,
  expect,
  describe,
  it,
  deps,
  requirements,
  validateApiCall,
  getMainCheckFn, generateInvalidDataArray,
} from '../deps';
import { randomBytes } from 'crypto';
import { cloneDeep, set } from 'lodash';
const { rte, request, server, localDb, constants } = deps;

const endpoint = () => request(server).post(`/${constants.API.DATABASES}/import`);

// input data schema
const databaseSchema = Joi.object({
  name: Joi.string().allow(null, ''),
  host: Joi.string().required(),
  port: Joi.number().integer().allow(true).required(),
  db: Joi.number().integer().allow(null, ''),
  username: Joi.string().allow(null, ''),
  password: Joi.string().allow(null, ''),
}).messages({
  'any.required': '{#label} should not be empty',
}).strict(true);

const validInputData = {
  name: constants.getRandomString(),
  host: constants.getRandomString(),
  port: 111,
};

const baseDatabaseData = {
  name: 'someName',
  host: constants.TEST_REDIS_HOST,
  port: constants.TEST_REDIS_PORT,
  username: constants.TEST_REDIS_USER || '',
  password: constants.TEST_REDIS_PASSWORD || '',
}

const baseSentinelData = {
  name: constants.TEST_SENTINEL_MASTER_GROUP,
  username: constants.TEST_SENTINEL_MASTER_USER || null,
  password: constants.TEST_SENTINEL_MASTER_PASS || null,
}

const importDatabaseFormat1 = {
  name: baseDatabaseData.name,
  host: baseDatabaseData.host,
  port: `${baseDatabaseData.port}`,
  username: baseDatabaseData.username,
  auth: baseDatabaseData.password,
}

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/import', () => {
  describe('Validation', function () {
    generateInvalidDataArray(databaseSchema)
      .map(({ path, value }) => {
        const database = path?.length ? set(cloneDeep(validInputData), path, value) : value;
        return {
          name: `Should not import when database: ${path.join('.')} = "${value}"`,
          attach: ['file', Buffer.from(JSON.stringify([database])), 'file.json'],
          responseBody: {
            total: 1,
            success: [],
            partial: [],
          },
          checkFn: ({ body }) => {
            expect(body.fail.length).to.eq(1);
            expect(body.fail[0].status).to.eq('fail');
            expect(body.fail[0].index).to.eq(0);
            expect(body.fail[0].errors.length).to.eq(1);
            expect(body.fail[0].errors[0].message).to.be.a('string');
            expect(body.fail[0].errors[0].statusCode).to.eq(400);
            expect(body.fail[0].errors[0].error).to.eq('Bad Request');
            if (body.fail[0].host) {
              expect(body.fail[0].host).to.be.a('string');
            }
            if (body.fail[0].port) {
              expect(body.fail[0].port).to.be.a('number');
            }
          }
        }
      })
      .map(async (testCase) => {
      it(testCase.name, async () => {
        await validateApiCall({
          endpoint,
          ...testCase,
        });
      });
    });

    [
      {
        name: 'Should fail due to file was not provided',
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          message: 'No import file provided',
          error: 'No Database Import File Provided',
        },
      },
      {
        name: 'Should fail due to file size (>10mb)',
        statusCode: 400,
        attach: ['file', randomBytes(11 * 1024 * 1024), 'filename.json'],
        responseBody: {
          statusCode: 400,
          message: 'Import file is too big. Maximum 10mb allowed',
          error: 'Invalid Database Import File',
        },
      },
      {
        name: 'Should fail to incorrect file format',
        statusCode: 400,
        attach: ['file', randomBytes(10), 'filename.json'],
        responseBody: {
          statusCode: 400,
          message: 'Unable to parse filename.json',
          error: 'Unable To Parse Database Import File',
        },
      },
      {
        name: 'Should truncate error message',
        statusCode: 400,
        attach: ['file', randomBytes(10), new Array(10_000).fill(1).join('')],
        responseBody: {
          statusCode: 400,
          message: `Unable to parse ${new Array(50).fill(1).join('')}...`,
          error: 'Unable To Parse Database Import File',
        },
      },
      {
        name: 'Should return 0/0 imported if mandatory field was not defined (host)',
        statusCode: 400,
        attach: ['file', randomBytes(10), new Array(10_000).fill(1).join('')],
        responseBody: {
          statusCode: 400,
          message: `Unable to parse ${new Array(50).fill(1).join('')}...`,
          error: 'Unable To Parse Database Import File',
        },
      },
    ].map(mainCheckFn);
  });
  describe('STANDALONE', () => {
    requirements('rte.type=STANDALONE');
    describe('NO TLS', function () {
      requirements('!rte.tls');
      it('Import standalone without tls (format 1)', async () => {
        const name = constants.getRandomString();

        await validateApiCall({
          endpoint,
          attach: ['file', Buffer.from(JSON.stringify([
            {
              ...importDatabaseFormat1,
              name,
            }
          ])), 'file.json'],
          responseBody: {
            total: 1,
            success: [{
              index: 0,
              status: 'success',
              host: importDatabaseFormat1.host,
              port: parseInt(importDatabaseFormat1.port, 10),
            }],
            partial: [],
            fail: [],
          },
        });

        // check connection
        const database = await localDb.getInstanceByName(name);
        await validateApiCall({
          endpoint: () => request(server).get(`/${constants.API.DATABASES}/${database.id}/connect`),
          statusCode: 200,
        });
        expect(database.new).to.eq(true);
      });
      describe('Oss', () => {
        requirements('!rte.re');
        it('Import standalone with particular db index', async () => {
          const name = constants.getRandomString();
          const cliUuid = constants.getRandomString();
          const browserKeyName = constants.getRandomString();
          const cliKeyName = constants.getRandomString();

          await validateApiCall({
            endpoint,
            attach: ['file', Buffer.from(JSON.stringify([
              {
                ...importDatabaseFormat1,
                name,
                db: constants.TEST_REDIS_DB_INDEX,
              }
            ])), 'file.json'],
            responseBody: {
              total: 1,
              success: [{
                index: 0,
                status: 'success',
                host: importDatabaseFormat1.host,
                port: parseInt(importDatabaseFormat1.port, 10),
              }],
              partial: [],
              fail: [],
            },
          });

          // check connection
          const database = await localDb.getInstanceByName(name);
          await validateApiCall({
            endpoint: () => request(server).get(`/${constants.API.DATABASES}/${database.id}/connect`),
            statusCode: 200,
          });

          // Create string using Browser API to particular db index
          await validateApiCall({
            endpoint: () => request(server).post(`/${constants.API.DATABASES}/${database.id}/string`),
            statusCode: 201,
            data: {
              keyName: browserKeyName,
              value: 'somevalue'
            },
          });

          // Create client for CLI
          await validateApiCall({
            endpoint: () => request(server).patch(`/${constants.API.DATABASES}/${database.id}/cli/${cliUuid}`),
            statusCode: 200,
          });

          // Create string using CLI API to 0 db index
          await validateApiCall({
            endpoint: () => request(server).post(`/${constants.API.DATABASES}/${database.id}/cli/${cliUuid}/send-command`),
            statusCode: 200,
            data: {
              command: `set ${cliKeyName} somevalue`,
            },
          });


          // check data created by db index
          await rte.data.executeCommand('select', `${constants.TEST_REDIS_DB_INDEX}`);
          expect(await rte.data.executeCommand('exists', cliKeyName)).to.eql(1)
          expect(await rte.data.executeCommand('exists', browserKeyName)).to.eql(1)

          // check data created by db index
          await rte.data.executeCommand('select', '0');
          expect(await rte.data.executeCommand('exists', cliKeyName)).to.eql(0)
          expect(await rte.data.executeCommand('exists', browserKeyName)).to.eql(0)
        });
      });
    });
    xdescribe('TLS CA', function () {
      requirements('rte.tls', '!rte.tlsAuth');
    });
    xdescribe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');
    });
  });
  describe('CLUSTER', () => {
    requirements('rte.type=CLUSTER');
    describe('NO TLS', function () {
      requirements('!rte.tls');
      it('should import cluster database (base64)', async () => {
        const name = constants.getRandomString();

        await validateApiCall({
          endpoint,
          attach: ['file', Buffer.from(Buffer.from(JSON.stringify([
            {
              ...importDatabaseFormat1,
              name,
              cluster: true,
            }
          ])).toString('base64')), 'file.ano'],
          responseBody: {
            total: 1,
            success: [{
              index: 0,
              status: 'success',
              host: importDatabaseFormat1.host,
              port: parseInt(importDatabaseFormat1.port, 10),
            }],
            partial: [],
            fail: [],
          },
        });


        // check connection
        const database = await localDb.getInstanceByName(name);

        expect(database.new).to.eq(true);
        expect(database.nodes).to.eq('[]');
        expect(database.connectionType).to.eq('CLUSTER');

        await validateApiCall({
          endpoint: () => request(server).get(`/${constants.API.DATABASES}/${database.id}/connect`),
          statusCode: 200,
        });

        expect((await localDb.getInstanceByName(name)).nodes).to.not.eq('[]');
      });
    });
    xdescribe('TLS CA', function () {
      requirements('rte.tls', '!rte.tlsAuth');
    });
  });
  xdescribe('SENTINEL', () => {
    requirements('rte.type=SENTINEL');
  });
});
