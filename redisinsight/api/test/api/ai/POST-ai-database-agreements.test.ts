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
import { constants } from '../../helpers/constants';

const { server, request, localDb } = deps;

const mockDatabaseId = 'POST-ai-messages-agreements-test-id'
// endpoint to test
const endpoint = () => request(server).post(`/ai/${mockDatabaseId}/agreements`);

const dataSchema = Joi.object().keys({
  dataConsent: Joi.boolean().required()
}).messages({ 'any.required': '{#label} must be a boolean value' }).strict(true);

const validInputData = {
  dataConsent: true
};

const responseSchema = Joi.object().keys({
  databaseId: Joi.string().required(),
  accountId: Joi.string().required(),
  dataConsent: Joi.boolean().required(),
}).required().strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('POST /ai/:databaseId/agreements', (done) => {
  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).forEach(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });
  describe('saveAigreements', (done) => {
    [
      {
        name: 'Should create database agreement if no database agreement is in db',
        data: validInputData,
        responseSchema,
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body).to.eql({ ...constants.TEST_AI_DATABASE_AGREEMENT, databaseId: mockDatabaseId })
        },
        endpoint,
        before: async () => {
          await localDb.clearAiDatabaseAgreements()
          await localDb.generateDatabase(mockDatabaseId)
        }
      },
      {
        name: 'Should update existing database agreement if database agreement is in db',
        data: { dataConsent: false },
        responseSchema,
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body).to.eql({ ...constants.TEST_AI_DATABASE_AGREEMENT, databaseId: mockDatabaseId, dataConsent: false })
        },
        endpoint,
        before: async () => {
          const databaseAgreement = await localDb.generateAiDatabaseAgreement({ databaseId: mockDatabaseId })
          expect(databaseAgreement.dataConsent).to.eql(true)
        }
      },

    ].map(mainCheckFn);
  });
});
