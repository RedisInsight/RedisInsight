import {
  describe,
  deps,
  Joi,
  getMainCheckFn,
  expect,
} from '../deps';
import { initApiUserProfileNockScope,  } from '../cloud/constants';

const { server, request, localDb } = deps;

const testAiDbId = 'test-ai-db-id'

// endpoint to test
const endpoint = (dbId?: string) => request(server).get(`/ai/${dbId || testAiDbId}/messages/agreement`);

const responseSchema = Joi.object().keys({
  aiAgreement: Joi.object().allow(null).keys({
    id: Joi.string().required(),
    databaseId: Joi.string().allow(null).required(),
    accountId: Joi.string().required(),
    createdAt: Joi.date().required(),
  })
}).required();

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('GET /ai/messages/agreement', (done) => {
  describe('get Ai agreement', (done) => {
    [
      {
        name: 'Should return null if no agreement for a given database exist',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.eql({ aiAgreement: null });
        },
        endpoint,
        before: async () => {
          await localDb.clearAiAgreements()
        }
      },
      {
        name: 'Should return agreement with a given databaseId',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.aiAgreement.databaseId).to.eql(testAiDbId)
        },
        endpoint,
        before: async () => {
          await localDb.generateAiAgreements({ databaseId: testAiDbId });
        },
      },
    ].map(mainCheckFn);
  });
});
