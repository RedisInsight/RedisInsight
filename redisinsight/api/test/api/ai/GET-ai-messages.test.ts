import {
  describe,
  deps,
  Joi,
  getMainCheckFn,
} from '../deps';
import { before } from "../../helpers/test";
import { initApiUserProfileNockScope,  } from '../cloud/constants';

const { server, request, localDb } = deps;

// endpoint to test
const endpoint = () => request(server).get(`/ai/messages`);

const responseSchema = Joi.object().keys({
  id: Joi.string().required(),
  content: Joi.string().required(),
}).required();

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('GET /ai/messages', (done) => {
  before(async () => {
    await localDb.generateAiMessages();
  });

  describe('get history', (done) => {
    [
      {
        name: 'Should return history with items',
        responseSchema,
        responseBody: [1],
      },
    ].map(mainCheckFn);
  });
});
