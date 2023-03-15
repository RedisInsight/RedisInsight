import {
  expect,
  describe,
  it,
  Joi,
  deps,
  validateApiCall,
} from '../deps';
const { server, request, constants, localDb } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/${constants.API.DATABASES}/${instanceId}/workbench/command-executions`);

const responseSchema = Joi.array().items(Joi.object().keys({
  id: Joi.string().required(),
  databaseId: Joi.string().required(),
  command: Joi.string().required(),
  role: Joi.string().allow(null),
  mode: Joi.string().required(),
  summary: Joi.string().allow(null),
  resultsMode: Joi.string().allow(null),
  executionTime: Joi.number().required(),
  nodeOptions: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().required(),
    enableRedirection: Joi.boolean().required(),
  }).allow(null),
  db: Joi.number().integer().allow(null),
  createdAt: Joi.date().required(),
})).required().max(30);

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    }
  });
};

describe('GET /databases/:instanceId/workbench/command-executions', () => {
  describe('Common', () => {
    [
      {
        name: 'Should return 0 array when no history items yet',
        responseSchema,
        before: async () => {
          await (await localDb.getRepository(localDb.repositories.COMMAND_EXECUTION)).clear();
        },
        checkFn: async ({ body }) => {
          expect(body).to.eql([]);
        },
      },
      {
        name: 'Should get only 30 items',
        responseSchema,
        before: async () => {
          await localDb.generateNCommandExecutions({
            databaseId: constants.TEST_INSTANCE_ID
          }, 100, true);
        },
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(30);
          for (let i = 0; i < 30; i ++) {
            expect(body[i].command).to.eql('set foo bar');
          }
        },
      },
      {
        name: 'Should return only 10 items that we are able to decrypt',
        responseSchema,
        before: async () => {
          await localDb.generateNCommandExecutions({
            databaseId: constants.TEST_INSTANCE_ID
          }, 10, true);
          await localDb.generateNCommandExecutions({
            databaseId: constants.TEST_INSTANCE_ID,
            command: 'invalidaencrypted',
            encryption: 'KEYTAR',
          }, 10);
        },
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(10);

          for (let i = 0; i < 10; i ++) {
            expect(body[i].command).to.eql('set foo bar');
          }
        },
      },
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found'
        },
      },
    ].map(mainCheckFn);
  });
});
