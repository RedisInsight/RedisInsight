import {
  describe,
  deps,
  Joi,
  getMainCheckFn,
  expect,
} from '../deps';
import { initApiUserProfileNockScope,  } from '../cloud/constants';

const { server, request, localDb } = deps;

// endpoint to test
const endpoint = () => request(server).post(`/ai/messages/agreement`);

const responseSchema = Joi.object().keys({
  id: Joi.string().required(),
  databaseId: Joi.string().allow(null).required(),
  accountId: Joi.string().required(),
  createdAt: Joi.date().required(),
}).required();

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('POST /ai/messages/agreement', (done) => {
  describe('post Ai agreement', (done) => {
    [
      {
        name: 'Should create agreement with a null databaseId',
        responseSchema,
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body.databaseId).to.eql(null);
        },
        endpoint,
        before: async () => {
          await localDb.clearAiAgreements()
        }
      },
    ].map(mainCheckFn);
  });
});
