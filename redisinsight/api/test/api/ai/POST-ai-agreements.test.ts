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

// endpoint to test
const endpoint = () => request(server).post(`/ai/agreements`);

const dataSchema = Joi.object().keys({
 consent: Joi.boolean().required()
}).messages({ 'any.required': '{#label} must be a boolean value' }).strict(true);

const validInputData = {
  consent: true
};

const responseSchema = Joi.object().keys({
  accountId: Joi.string().required(),
  consent: Joi.boolean().required(),
}).required().strict(true);

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
        name: 'Should create general agreement if no general agreement in the db',
        data: validInputData,
        responseSchema,
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body).to.eql(constants.TEST_AI_AGREEMENT);
        },
        endpoint,
        before: async () => {
          await localDb.clearAiAgreements()
        }
      },
      {
        name: 'Should update general agreement if agreement is already in db',
        data: { consent: false },
        responseSchema,
        statusCode: 200,
        checkFn: ({ body }) => {
          expect(body.accountId).to.eql(constants.TEST_AI_AGREEMENT.accountId)
          expect(body.consent).to.eql(false)
        },
        endpoint,
        before: async () => {
          const generalAgreement = await localDb.generateAiAgreement()
          expect(generalAgreement.consent).to.eql(true)
        },
      },
    ].map(mainCheckFn);
  });
});
