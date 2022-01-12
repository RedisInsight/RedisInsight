import { Joi, expect, describe, it, before, deps, requirements, validateApiCall } from '../deps';
const { rte, request, server, localDb, constants } = deps;

const endpoint = () => request(server).post('/instance');

const responseSchema = Joi.object().keys({
  id: Joi.string().required(),
  name: Joi.string().required(),
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  db: Joi.number().integer().allow(null),
  connectionType: Joi.string().valid('STANDALONE', 'CLUSTER', 'SENTINEL').required(),
  username: Joi.string().allow(null).required(),
  password: Joi.string().allow(null).required(),
  nameFromProvider: Joi.string().allow(null).required(),
  lastConnection: Joi.date().allow(null).required(),
  provider: Joi.string().valid('LOCALHOST', 'UNKNOWN', 'RE_CLOUD', 'RE_CLUSTER').required(),
  tls: Joi.object().keys({
    verifyServerCert: Joi.boolean().required(),
    caCertId: Joi.string(),
    clientCertPairId: Joi.string(),
  }),
  endpoints: Joi.array().items({
    host: Joi.string().required(),
    port: Joi.number().integer().required(),
  }),
  modules: Joi.array().items({
    name: Joi.string().required(),
    version: Joi.number().integer(),
    semanticVersion: Joi.string(),
  }),
}).required();

describe('POST /instance', () => {
  // todo: add validation tests
  describe('Validation', function () {});
  // todo: cover connection error for incorrect host + port [describe('common')]
  describe('STANDALONE', () => {
    requirements('rte.type=STANDALONE');
    describe('Create standalone instance without pass', function () {
      requirements('!rte.tls', '!rte.pass');
      it('Create standalone without pass', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            username: null,
            password: null,
            connectionType: constants.STANDALONE,
          },
        });
      });
      describe('Enterprise', () => {
        requirements('rte.re');
        it('Should throw an error if db index specified', async () => {
          const dbName = constants.getRandomString();

          await validateApiCall({
            endpoint,
            statusCode: 400,
            data: {
              name: dbName,
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
              db: constants.TEST_REDIS_DB_INDEX
            },
          });
        });
      });
      describe('Oss', () => {
        requirements('!rte.re');
        it('Create standalone with particular db index', async () => {
          let addedId;
          const dbName = constants.getRandomString();
          const cliUuid = constants.getRandomString();
          const browserKeyName = constants.getRandomString();
          const cliKeyName = constants.getRandomString();

          await validateApiCall({
            endpoint,
            statusCode: 201,
            data: {
              name: dbName,
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
              db: constants.TEST_REDIS_DB_INDEX,
            },
            responseSchema,
            responseBody: {
              name: dbName,
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
              db: constants.TEST_REDIS_DB_INDEX,
              username: null,
              password: null,
              connectionType: constants.STANDALONE,
            },
            checkFn: ({ body }) => {
              addedId = body.id;
            }
          });

          // Create string using Browser API to particular db index
          await validateApiCall({
            endpoint: () => request(server).post(`/instance/${addedId}/string`),
            statusCode: 201,
            data: {
              keyName: browserKeyName,
              value: 'somevalue'
            },
          });

          // Create client for CLI
          await validateApiCall({
            endpoint: () => request(server).patch(`/instance/${addedId}/cli/${cliUuid}`),
            statusCode: 200,
          });

          // Create string using CLI API to 0 db index
          await validateApiCall({
            endpoint: () => request(server).post(`/instance/${addedId}/cli/${cliUuid}/send-command`),
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
    describe('Create standalone instance with password', function () {
      requirements('!rte.tls', 'rte.pass');
      it('Create standalone with password', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(undefined);

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            password: constants.TEST_REDIS_PASSWORD,
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            username: null,
            password: constants.TEST_REDIS_PASSWORD,
            connectionType: constants.STANDALONE,
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      // todo: cover connection error for incorrect username/password
    });
    describe('Create standalone instance tls', function () {
      requirements('rte.tls', '!rte.tlsAuth');
      it('Create standalone instance using tls without CA verify', async () => {
        const dbName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(undefined);

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: {
              verifyServerCert: false,
            }
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: {
              verifyServerCert: false,
            }
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      it('Create standalone instance using tls and verify and create CA certificate (new)', async () => {
        const dbName = constants.getRandomString();
        const newCaName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(undefined);

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: {
              verifyServerCert: true,
              newCaCert: {
                name: newCaName,
                cert: constants.TEST_REDIS_TLS_CA,
              }
            }
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: {
              verifyServerCert: true,
            },
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      it('Should throw an error without CA cert when cert validation enabled', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(undefined);

        await validateApiCall({
          endpoint,
          statusCode: 400,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: {
              verifyServerCert: true,
            }
          },
          responseBody: {
            statusCode: 400,
            // todo: verify error handling because right now messages are different
            // message: '???',
            error: 'Bad Request'
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(undefined);
      });
      it('Should throw an error with invalid CA cert', async () => {
        const dbName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(undefined);

        await validateApiCall({
          endpoint,
          statusCode: 400,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: {
              verifyServerCert: true,
              newCaCert: {
                name: 'aaaaa',
                cert: 'invalid'
              }
            }
          },
          responseBody: {
            statusCode: 400,
            // todo: verify error handling because right now messages are different
            // message: '???',
            error: 'Bad Request'
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(undefined);
      });
    });
    describe('Create standalone instance tls with certificate auth', function () {
      requirements('rte.tls', 'rte.tlsAuth');

      let existingCACertId, existingClientCertId, existingClientCertName;
      before(async () => {
        // await localDb
      });
      it('Create standalone instance and verify users certs (new certificates)', async () => {
        const dbName = constants.getRandomString();
        const newCaName = constants.getRandomString();
        const newClientCertName = existingClientCertName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(undefined);

        const { body } = await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: {
              verifyServerCert: true,
              newCaCert: {
                name: newCaName,
                cert: constants.TEST_REDIS_TLS_CA,
              },
              newClientCertPair: {
                name: newClientCertName,
                cert: constants.TEST_USER_TLS_CERT,
                key: constants.TEST_USER_TLS_KEY,
              }
            }
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: {
              verifyServerCert: true,
            }
          },
        });

        // remember certificates ids
        existingCACertId = body.caCertid;
        existingClientCertId = body.clientCertPairId;

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      // todo: investigate/fix an error (self signed certificate in the certificates chain)
      xit('Should create standalone instance with existing certificates', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(undefined);

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: {
              verifyServerCert: true,
              caCertId: existingCACertId,
              clientCertPairId: existingClientCertId,
            },
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: {
              verifyServerCert: true,
              caCertId: existingCACertId,
              clientCertPairId: existingClientCertId,
            }
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      it('Should throw an error if try to create client certificate with existing name', async () => {
        const dbName = constants.getRandomString();
        const newCaName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(undefined);

        await validateApiCall({
          endpoint,
          statusCode: 400,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: {
              verifyServerCert: true,
              newCaCert: {
                name: newCaName,
                cert: constants.TEST_REDIS_TLS_CA,
              },
              newClientCertPair: {
                name: existingClientCertName,
                cert: constants.TEST_USER_TLS_CERT,
                key: constants.TEST_USER_TLS_KEY,
              }
            }
          },
          responseBody: {
            error: 'Bad Request',
            message: 'This client certificate name is already in use.',
            statusCode: 400,
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(undefined);
      });
    });
  });
  describe('CLUSTER', () => {
    requirements('rte.type=CLUSTER');
    describe('Create cluster instance without pass', function () {
      requirements('!rte.tls', '!rte.pass');
      it('Create instance without pass', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
          },
          responseSchema,
          responseBody: {
            name: dbName,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.CLUSTER,
            endpoints: rte.env.nodes,
          },
        });
      });
      it('Should throw an error if db index specified', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint,
          statusCode: 400,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            db: constants.TEST_REDIS_DB_INDEX
          },
        });
      });
    });
    describe('TLS CA', function () {
      requirements('rte.tls', '!rte.tlsAuth');
      it('Should create instance without CA tls', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: {
              verifyServerCert: false,
            }
          },
          responseSchema,
          responseBody: {
            name: dbName,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.CLUSTER,
            endpoints: rte.env.nodes,
            tls: {
              verifyServerCert: false,
            }
          },
        });
      });
      it('Should create instance tls and create new CA cert', async () => {
        const dbName = constants.getRandomString();

        const { body } = await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: {
              verifyServerCert: true,
              newCaCert: {
                name: constants.getRandomString(),
                cert: constants.TEST_REDIS_TLS_CA,
              },
            },
          },
          responseSchema,
          responseBody: {
            name: dbName,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.CLUSTER,
            endpoints: rte.env.nodes,
            tls: {
              verifyServerCert: true,
            },
          },
        });
      });
      // todo: Should throw an error without CA cert when cert validation enabled
      // todo: Should throw an error with invalid CA cert
    });
  });
  describe('SENTINEL', () => {
    requirements('rte.type=SENTINEL');
    it('Should always throw an Invalid Data error for sentinel', async () => {
      await validateApiCall({
        endpoint,
        data: {
          name: constants.getRandomString(),
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
          password: constants.TEST_REDIS_PASSWORD,
        },
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          error: 'SENTINEL_PARAMS_REQUIRED',
          message: 'Sentinel master name must be specified.'
        },
      });
    });
  });
});
