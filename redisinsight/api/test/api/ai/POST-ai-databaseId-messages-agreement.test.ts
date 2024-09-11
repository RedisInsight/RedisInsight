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
const endpoint = (dbId?: string) => request(server).post(`/ai/${dbId || testAiDbId}/messages/agreement`);

const responseSchema = Joi.object().keys({
  id: Joi.string().required(),
  databaseId: Joi.string().allow(null).required(),
  accountId: Joi.string().required(),
  createdAt: Joi.date().required(),
}).required();

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('POST /ai/:databaseId/messages/agreement', (done) => {
  describe('post Ai agreement', (done) => {
    [
      {
        name: 'Should create agreement with a databaseId given in the params',
        responseSchema,
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body.databaseId).to.eql(testAiDbId);
        },
        endpoint,
        before: async () => {
          await localDb.checkDatabaseExist(testAiDbId)
          await localDb.clearAiAgreements()
        }
      },
    ].map(mainCheckFn);
  });
});
