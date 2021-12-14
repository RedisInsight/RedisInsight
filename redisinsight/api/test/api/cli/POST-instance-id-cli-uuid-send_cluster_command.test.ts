import {
  expect,
  describe,
  it,
  before,
  Joi,
  _,
  deps,
  validateApiCall,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID, uuid = constants.TEST_CLI_UUID_1) =>
  request(server).post(`/instance/${instanceId}/cli/${uuid}/send-cluster-command`);

// input data schema
const dataSchema = Joi.object({
  command: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
  role: Joi.string().required().valid('ALL', 'MASTER', 'SLAVE'),
  outputFormat: Joi.string().allow(null).valid('TEXT', 'RAW'),
}).strict();

const validInputData = {
  command: 'set foo bar',
  role: 'ALL',
};

const responseSchema = Joi.array().items(Joi.object().keys({
  response: Joi.string().required(),
  status: Joi.string().required(),
  node: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().integer().required(),
    slot: Joi.number().integer(),
  })
}).required());

const responseRawSchema = Joi.array().items(Joi.object().keys({
  response: Joi.any().required(),
  status: Joi.string().required(),
  node: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().integer().required(),
    slot: Joi.number().integer(),
  })
}).required());

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

describe('POST /instance/:instanceId/cli/:uuid/send-cluster-command', () => {
  requirements('rte.type=CLUSTER');

  before(rte.data.truncate);

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should create string',
        data: {
          command: `set ${constants.TEST_STRING_KEY_1} ${constants.TEST_STRING_VALUE_1}`,
          outputFormat: 'TEXT',
          role: 'ALL',
        },
        responseSchema,
        before: async () => {
          expect(await rte.client.exists(constants.TEST_STRING_KEY_1)).to.eql(0);
        },
        after: async () => {
          expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eql(constants.TEST_STRING_VALUE_1);
        }
      },
      {
        name: 'Should get string',
        data: {
          command: `get ${constants.TEST_STRING_KEY_1}`,
          outputFormat: 'TEXT',
          role: 'ALL',
        },
        responseSchema,
        checkFn: async ({ body }) => {
          expect((body.filter(shard => shard.status === 'success'))[0].response)
            .to.have.string(constants.TEST_STRING_VALUE_1)
        }
      },
      {
        name: 'Should remove string',
        data: {
          command: `del ${constants.TEST_STRING_KEY_1}`,
          outputFormat: 'TEXT',
          role: 'ALL',
        },
        responseSchema,
        after: async () => {
          expect(await rte.client.exists(constants.TEST_STRING_KEY_1)).to.eql(0);
        }
      },
    ].map(mainCheckFn);
  });

  describe('Single Node', () => {
    const node = rte.env.nodes[0];
    const nodeOptions = {
      host: node?.host,
      port: node?.port,
      enableRedirection: true,
    };
    describe('String', () => {
      [
        {
          name: 'Should create string',
          data: {
            command: `set ${constants.TEST_STRING_KEY_1} ${constants.TEST_STRING_VALUE_1}`,
            outputFormat: 'TEXT',
            role: 'ALL',
            nodeOptions
          },
          responseSchema,
          before: async () => {
            expect(await rte.client.exists(constants.TEST_STRING_KEY_1)).to.eql(0);
          },
          checkFn: ({ body }) => {
            expect(body).to.have.a.lengthOf(1);
          },
          after: async () => {
            expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eql(constants.TEST_STRING_VALUE_1);
          }
        },
        {
          name: 'Should get string',
          data: {
            command: `get ${constants.TEST_STRING_KEY_1}`,
            outputFormat: 'TEXT',
            role: 'ALL',
            nodeOptions
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body).to.have.a.lengthOf(1);
            expect(body[0].response).to.have.string(constants.TEST_STRING_VALUE_1);
          }
        },
        {
          name: 'Should remove string',
          data: {
            command: `del ${constants.TEST_STRING_KEY_1}`,
            outputFormat: 'TEXT',
            role: 'ALL',
            nodeOptions
          },
          responseSchema,
          after: async () => {
            expect(await rte.client.exists(constants.TEST_STRING_KEY_1)).to.eql(0);
          }
        },
      ].map(mainCheckFn);
    })
    describe('Raw output', () => {
      [
        {
          name: 'Should return a string type response',
          data: {
            command: `set ${constants.TEST_STRING_KEY_1} ${constants.TEST_STRING_VALUE_1}`,
            outputFormat: 'RAW',
            role: 'ALL',
            nodeOptions
          },
          responseRawSchema,
          checkFn: ({ body }) => {
            expect(body).to.have.a.lengthOf(1);
            expect(body[0].response).to.eql('OK')
          }
        },
        {
          name: 'Should return a number type response',
          data: {
            command: `del ${constants.TEST_STRING_KEY_1}`,
            outputFormat: 'RAW',
            role: 'ALL',
            nodeOptions
          },
          responseRawSchema,
          checkFn: ({ body }) => {
            expect(body).to.have.a.lengthOf(1);
            expect(body[0].response).to.be.a('number')
          }
        },
        {
          name: 'Should return an array type response',
          data: {
            command: `lrange ${constants.TEST_LIST_KEY_1} 0 100`,
            outputFormat: 'RAW',
            role: 'ALL',
            nodeOptions
          },
          responseRawSchema,
          before: async () => {
            await rte.client.lpush(constants.TEST_LIST_KEY_1, constants.TEST_LIST_ELEMENT_1, constants.TEST_LIST_ELEMENT_2)
          },
          after: async () => {
            await rte.client.del(constants.TEST_LIST_KEY_1)
          },
          checkFn: ({ body }) => {
            expect(body).to.have.a.lengthOf(1);
            expect(body[0].response).to.eql([
              constants.TEST_LIST_ELEMENT_2,
              constants.TEST_LIST_ELEMENT_1,
            ]);
          }
        },
        {
          name: 'Should return an object type response',
          data: {
            command: `hgetall ${constants.TEST_HASH_KEY_1}`,
            outputFormat: 'RAW',
            role: 'ALL',
            nodeOptions
          },
          responseRawSchema,
          before: async () => {
            await rte.client.hset(constants.TEST_HASH_KEY_1, [constants.TEST_HASH_FIELD_1_NAME, constants.TEST_HASH_FIELD_1_VALUE]);
          },
          after: async () => {
            await rte.client.del(constants.TEST_HASH_KEY_1);
          },
          checkFn: ({ body }) => {
            expect(body).to.have.a.lengthOf(1);
            expect(body[0].response).to.be.an('object');
            expect(body[0].response).to.deep.eql({[constants.TEST_HASH_FIELD_1_NAME]: constants.TEST_HASH_FIELD_1_VALUE});
          }
        },
      ].map(mainCheckFn);
    })
  });

  describe('Commands redirection', () => {
    const nodes = rte.env.nodes;
    _.map(nodes, (node) => ({
      name: `Should create string with redirection if needed (${node.host}:${node.port})`,
      data: {
        command: `set ${constants.TEST_STRING_KEY_1} ${node.host}`,
        outputFormat: 'TEXT',
        role: 'ALL',
        nodeOptions: {
          host: node.host,
          port: node.port,
          enableRedirection: true,
        }
      },
      responseSchema,
      checkFn: ({ body }) => {
        expect(body[0].response === '"OK"' || body[0].response.toLowerCase().includes('redirected')).to.eql(true);
      },
      after: async () => {
        expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eql(node.host);
      }
    })).map(mainCheckFn);
  })
});
