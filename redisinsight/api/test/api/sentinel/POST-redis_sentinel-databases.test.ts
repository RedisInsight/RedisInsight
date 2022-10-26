import { Joi, expect, describe, after, it, deps, requirements, validateApiCall } from '../deps';
const { rte, request, server, constants, localDb } = deps;

const endpoint = () => request(server).post('/redis-sentinel/databases');

const responseSchema = Joi.array().items(Joi.object().keys({
  id: Joi.string().required(),
  name: Joi.string().required(),
  status: Joi.string().required(),
  message: Joi.string().required(),
}));

// todo: check if we need this
xdescribe('POST /redis-sentinel/databases', () => {
  requirements('rte.type=SENTINEL');
  after(localDb.initAgreements);

  // todo: add validation tests
  describe('Validation', function () {});
  // todo: cover connection error for incorrect host + port [describe('common')]
  describe('Common', () => {
    it('Create sentinel database', async () => {
      const dbName = constants.getRandomString();

      await validateApiCall({
        endpoint,
        statusCode: 201,
        data: {
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
          username: constants.TEST_REDIS_USER,
          password: constants.TEST_REDIS_PASSWORD,
          masters: [{
            alias: dbName,
            name: constants.TEST_SENTINEL_MASTER_GROUP,
            username: constants.TEST_SENTINEL_MASTER_USER,
            password: constants.TEST_SENTINEL_MASTER_PASS,
          }],
        },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(1);
          expect(body[0].name).to.eql(constants.TEST_SENTINEL_MASTER_GROUP);
          expect(body[0].status).to.eql('success');
          expect(body[0].message).to.eql('Added');

          const db: any = await (await localDb.getRepository(localDb.repositories.INSTANCE)).findOneBy({
            id: body[0].id,
          });

          expect(db.password).to.eql(localDb.encryptData(constants.TEST_REDIS_PASSWORD));
          expect(db.sentinelMasterPassword).to.eql(localDb.encryptData(constants.TEST_SENTINEL_MASTER_PASS));
        },
      });
    });
    it('Create sentinel database with plain pass', async () => {
      await localDb.setAgreements({
        encryption: false,
      });

      const dbName = constants.getRandomString();

      await validateApiCall({
        endpoint,
        statusCode: 201,
        data: {
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
          username: constants.TEST_REDIS_USER,
          password: constants.TEST_REDIS_PASSWORD,
          masters: [{
            alias: dbName,
            name: constants.TEST_SENTINEL_MASTER_GROUP,
            username: constants.TEST_SENTINEL_MASTER_USER,
            password: constants.TEST_SENTINEL_MASTER_PASS,
          }],
        },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(1);
          expect(body[0].name).to.eql(constants.TEST_SENTINEL_MASTER_GROUP);
          expect(body[0].status).to.eql('success');
          expect(body[0].message).to.eql('Added');

          const db: any = await (await localDb.getRepository(localDb.repositories.INSTANCE)).findOneBy({
            id: body[0].id,
          });

          expect(db.password).to.eql(constants.TEST_REDIS_PASSWORD);
          expect(db.sentinelMasterPassword).to.eql(constants.TEST_SENTINEL_MASTER_PASS);
        },
      });
    });
    it('Create sentinel database with particular db index', async () => {
      let addedId;
      const dbName = constants.getRandomString();
      const cliUuid = constants.getRandomString();
      const browserKeyName = constants.getRandomString();
      const cliKeyName = constants.getRandomString();

      await validateApiCall({
        endpoint,
        statusCode: 201,
        data: {
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
          username: constants.TEST_REDIS_USER,
          password: constants.TEST_REDIS_PASSWORD,
          masters: [{
            db: constants.TEST_REDIS_DB_INDEX,
            alias: dbName,
            name: constants.TEST_SENTINEL_MASTER_GROUP,
            username: constants.TEST_SENTINEL_MASTER_USER,
            password: constants.TEST_SENTINEL_MASTER_PASS,
          }],
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(1);
          addedId = body[0].id;
          expect(body[0].name).to.eql(constants.TEST_SENTINEL_MASTER_GROUP);
          expect(body[0].status).to.eql('success');
          expect(body[0].message).to.eql('Added');
        },
      });

      // Create string using Browser API to particular db index
      await validateApiCall({
        endpoint: () => request(server).post(`/${constants.API.DATABASES}/${addedId}/string`),
        statusCode: 201,
        data: {
          keyName: browserKeyName,
          value: 'somevalue'
        },
      });

      // Create client for CLI
      await validateApiCall({
        endpoint: () => request(server).patch(`/${constants.API.DATABASES}/${addedId}/cli/${cliUuid}`),
        statusCode: 200,
      });

      // Create string using CLI API to 0 db index
      await validateApiCall({
        endpoint: () => request(server).post(`/${constants.API.DATABASES}/${addedId}/cli/${cliUuid}/send-command`),
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
