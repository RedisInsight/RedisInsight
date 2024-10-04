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

// endpoint to test
const endpoint = () => request(server).post(`/ai/messages/agreements`);

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
  createdAt: Joi.any().required(),
})).required().strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('POST /ai/messages/agreements', (done) => {
  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).forEach(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });
  describe('post Ai agreements', (done) => {
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
        name: 'Should not create database agreement even if db is set to true',
        data: { general: true, db: true },
        responseSchema,
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(1);
          expect(body.filter(agr => !!agr.databaseId).length).to.eql(0);
        },
        endpoint,
        before: async () => {
          await localDb.clearAiAgreements()
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
    ].map(mainCheckFn);
  });
});
