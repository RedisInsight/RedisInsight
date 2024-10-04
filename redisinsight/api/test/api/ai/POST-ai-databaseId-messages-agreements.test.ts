import {
  describe,
  deps,
  Joi,
  getMainCheckFn,
  expect,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../deps';
import { initApiUserProfileNockScope,  } from '../cloud/constants';

const { server, request, localDb } = deps;

const mockDatabaseId = 'POST-ai-messages-agreements-test-id'
// endpoint to test
const endpoint = () => request(server).post(`/ai/${mockDatabaseId}/messages/agreements`);

const dataSchema = Joi.object().keys({
 general: Joi.boolean().required(),
 db: Joi.boolean().allow(null),
}).messages({ 'any.required': '{#label} must be a boolean value' }).strict(true);

const validInputData = {
  general: true,
  db: false,
};

const responseSchema = Joi.array().items(Joi.object().keys({
  id: Joi.string().required(),
  databaseId: Joi.string().allow(null).required(),
  accountId: Joi.string().required(),
  // createdAt: Joi.date().required(),
  createdAt: Joi.any().required(),
})).required().strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('POST /ai/:databaseId/messages/agreements', (done) => {
  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).forEach(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });
  describe('updateAigreements', (done) => {
    [
      {
        name: 'Should create general agreement with a null databaseId if general set to true and no general agreement in the db',
        data: validInputData,
        responseSchema,
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(1);
          expect(body.filter(agr => !agr.databaseId).length).to.eql(1);
        },
        endpoint,
        before: async () => {
          await localDb.clearAiAgreements()
        }
      },
      {
        name: 'Should create database agreement if db is set to true',
        data: { general: false, db: true },
        responseSchema,
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(1);
          expect(body.filter(agr => agr.databaseId === mockDatabaseId).length).to.eql(1);
        },
        endpoint,
        before: async () => {
          await localDb.clearAiAgreements()
          await localDb.generateDatabase(mockDatabaseId)
        }
      },
      {
        name: 'Should delete general agreement if general is set to false',
        data: { general: false, db: false },
        responseSchema,
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(0);
          expect(body.filter(agr => !agr.databaseId).length).to.eql(0);
        },
        endpoint,
        before: async () => {
          await localDb.generateAiAgreement({ databaseId: null }, true)
        }
      },
      {
        name: 'Should delete database agreement if db is set to false',
        data: { general: false, db: false },
        responseSchema,
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body.filter(agr => agr.databaseId === mockDatabaseId).length).to.eql(0);
        },
        endpoint,
        before: async () => {
          await localDb.generateAiAgreement({ databaseId: mockDatabaseId }, true)
        }
      },
    ].map(mainCheckFn);
  });
});
