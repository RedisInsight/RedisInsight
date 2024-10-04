import {
  describe,
  deps,
  Joi,
  getMainCheckFn,
  expect,
} from '../deps';
import { initApiUserProfileNockScope,  } from '../cloud/constants';

const { server, request, localDb } = deps;
const mockDbid = '1234'

// endpoint to test
const endpoint = () => request(server).get(`/ai/messages/agreements`);

const responseSchema = Joi.array().items(Joi.object().keys({
  id: Joi.string().required(),
  databaseId: Joi.string().allow(null).required(),
  accountId: Joi.string().required(),
  createdAt: Joi.any().required(),
})).required().strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('GET /ai/messages/agreements', (done) => {
  describe('get Ai agreement', (done) => {
    [
      {
        name: 'Should return empty array if no agreements in a database',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.eql([]);
        },
        endpoint,
        before: async () => {
          await localDb.clearAiAgreements()
        }
      },
      {
        name: 'Should return both general and database agreements',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(2)
          expect(body.filter((agr) => !agr.databaseId).length).to.eql(1)
          expect(body.filter((agr) => agr.databaseId === mockDbid).length).to.eql(1)
        },
        endpoint,
        before: async () => {
          await localDb.generateAiAgreement({id: 'general-ai-agreement-id', databaseId: null }, false)
          await localDb.generateAiAgreement({ databaseId: mockDbid}, false);
        },
      },
    ].map(mainCheckFn);
  });
});
