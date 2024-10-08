import {
  describe,
  deps,
  Joi,
  getMainCheckFn,
  expect,
} from '../deps';
import { initApiUserProfileNockScope,  } from '../cloud/constants';
import { constants } from '../../helpers/constants';

const { server, request, localDb } = deps;

// endpoint to test
const endpoint = () => request(server).get(`/ai/agreements`);

const responseSchema = Joi.object().keys({
  accountId: Joi.string().required(),
  consent: Joi.boolean().required(),
});

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('GET /ai/agreements', (done) => {
  describe('get Ai agreement', (done) => {
    [
      {
        name: 'Should be successful even if no agreement for an account found',
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body).to.eql({});
        },
        endpoint,
        before: async () => {
          await localDb.clearAiAgreements()
        }
      },
      {
        name: 'Should return ai agreement',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.eql(constants.TEST_AI_AGREEMENT)
        },
        endpoint,
        before: async () => {
          await localDb.generateAiAgreement()
        },
      },
      {
        name: 'Should not return ai agreement of another accountId',
        checkFn: ({ body }) => {
          expect(body).to.eql({})
        },
        endpoint,
        before: async () => {
          await localDb.generateAiAgreement({ accountId: 'differentAccountId'})
        },
      },
    ].map(mainCheckFn);
  });
});
