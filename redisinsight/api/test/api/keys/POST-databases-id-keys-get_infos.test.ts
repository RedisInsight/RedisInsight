import {
  expect,
  describe,
  it,
  before,
  deps,
  Joi,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall,
  JoiRedisString,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/keys/get-metadata`);

const responseSchema = Joi.array().items(Joi.object().keys({
  name: JoiRedisString.required(),
  type: Joi.string().required(),
  ttl: Joi.number().integer().required(),
  size: Joi.number().integer().allow(null).required(),
})).required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    if (testCase.before) {
      await testCase.before();
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('POST /databases/:instanceId/keys/get-metadata', () => {
  before(async () => await rte.data.generateKeys(true));

  describe('Modes', () => {
    requirements('!rte.bigData');
    before(rte.data.generateBinKeys);

    [
      {
        name: 'Should return string info in utf8 (default)',
        data: {
          keys: [constants.TEST_STRING_KEY_BIN_BUF_OBJ_1],
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body[0].name).to.eq(constants.TEST_STRING_KEY_BIN_UTF8_1);
        }
      },
      {
        name: 'Should return string info in utf8',
        query: {
          encoding: 'utf8',
        },
        data: {
          keys: [constants.TEST_STRING_KEY_BIN_BUF_OBJ_1],
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body[0].name).to.eq(constants.TEST_STRING_KEY_BIN_UTF8_1);
        }
      },
      {
        name: 'Should return string info in ASCII',
        query: {
          encoding: 'ascii',
        },
        data: {
          keys: [constants.TEST_STRING_KEY_BIN_ASCII_1],
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body[0].name).to.eq(constants.TEST_STRING_KEY_BIN_ASCII_1);
        }
      },
      {
        name: 'Should return string info in Buffer',
        query: {
          encoding: 'buffer',
        },
        data: {
          keys: [constants.TEST_STRING_KEY_BIN_BUF_OBJ_1],
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body[0].name).to.deep.eq(constants.TEST_STRING_KEY_BIN_BUF_OBJ_1);
        }
      },
      {
        name: 'Should return error when send unicode with unprintable chars',
        query: {
          encoding: 'utf8',
        },
        data: {
          keys: [constants.TEST_STRING_KEY_BIN_UTF8_1],
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body[0].name).to.deep.eq(constants.TEST_STRING_KEY_BIN_UTF8_1);
          expect(body[0].ttl).to.deep.eq(-2);
          expect(body[0].size).to.deep.eq(null);
          expect(body[0].type).to.deep.eq('none');
        }
      },
      {
        name: 'Should return string info in Buffer and Type',
        query: {
          encoding: 'buffer',
        },
        data: {
          keys: [constants.TEST_STRING_KEY_BIN_BUF_OBJ_1],
          type: constants.TEST_LIST_TYPE,
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body[0].name).to.deep.eq(constants.TEST_STRING_KEY_BIN_BUF_OBJ_1);
          expect(body[0].type).to.deep.eq(constants.TEST_LIST_TYPE);
        }
      },
    ].map(mainCheckFn);
  });

  describe('ACL', () => {
    requirements('rte.acl');
    before(async () => rte.data.setAclUserRules('~* +@all'));

    [
      {
        name: 'Should return key info',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keys: [constants.TEST_STRING_KEY_1],
        },
      },
      {
        name: 'Should not throw error if no acl permissions',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        before: () => rte.data.setAclUserRules('~* +@all -ttl -memory -type'),
        data: {
          keys: [constants.TEST_STRING_KEY_1],
        },
      },
    ].map(mainCheckFn);
  });
});
