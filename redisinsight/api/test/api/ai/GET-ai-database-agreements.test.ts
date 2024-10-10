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
const mockDbid = '1234'

// endpoint to test
const endpoint = () => request(server).get(`/ai/${mockDbid}/agreements`);

const responseSchema = Joi.object().keys({
  databaseId: Joi.string().required(),
  accountId: Joi.string().required(),
  dataConsent: Joi.boolean().required(),
});

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('GET /ai/:databaseId/agreements', (done) => {
  describe('get Ai Database agreement', (done) => {
    [
      {
        name: 'Should not fail if no ai database agreement',
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body).to.eql({})
        },
        endpoint,
        before: async () => {
          await localDb.clearAiDatabaseAgreements()
        },
      },
      {
        name: 'Should return ai database agreement',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.eql({ ...constants.TEST_AI_DATABASE_AGREEMENT, databaseId: mockDbid })
        },
        endpoint,
        before: async () => {
          await localDb.generateAiDatabaseAgreement({ databaseId: mockDbid })
        },
      },
      {
        name: 'Should not return ai database agreement for a different account or database',
        checkFn: ({ body }) => {
          expect(body).to.eql({})
        },
        endpoint,
        before: async () => {
          await localDb.generateAiDatabaseAgreement({ databaseId: mockDbid, accountId: 'differentAccountId' })
          await localDb.generateAiDatabaseAgreement({ databaseId: 'differentDatabaseId' }, false)
        },
      },
    ].map(mainCheckFn);
  });
});
