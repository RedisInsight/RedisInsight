import {
  describe,
  deps,
  Joi,
  getMainCheckFn,
  expect,
} from '../deps';
import { initApiUserProfileNockScope,  } from '../cloud/constants';
import { AiMessageType, AiTools } from 'src/modules/ai/models';

const { server, request, localDb } = deps;

// endpoint to test
const endpoint = () => request(server).get(`/ai/messages`);

const responseSchema = Joi.array().items(Joi.object().keys({
  id: Joi.string().required(),
  type: Joi.string().allow(AiMessageType.HumanMessage, AiMessageType.AiMessage).required(),
  tool: Joi.string().allow(AiTools.General).required(),
  databaseId: Joi.string().allow(null).required(),
  accountId: Joi.string().required(),
  conversationId: Joi.string().allow(null),
  content: Joi.string().required(),
  createdAt: Joi.date().required(),
  steps: Joi.array().allow(null),
})).required();

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('GET /ai/messages', (done) => {
  describe('get history', (done) => {
    [
      {
        name: 'Should return history with general messages only with null database',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(2);
          expect(body.filter(el => el.tool === AiTools.General && el.databaseId == null).length).to.eql(2)
        },
        endpoint,
        before: async () => {
          await localDb.generateAiMessages();
        },
      },
      {
        name: 'Should return history with general messages only with null database',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(0);
          expect(body.filter(el => el.tool === AiTools.General && el.databaseId == null).length).to.eql(0)
        },
        endpoint,
        before: async () => {
          await localDb.generateAiDatabaseMessages();
        },
      },
      {
        name: 'Should return history with general messages only with null database',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(0);
          expect(body.filter(el => el.tool === AiTools.General && el.databaseId == null).length).to.eql(0)
        },
        endpoint,
        before: async () => {
          await localDb.generateAiDatabaseMessages();
        },
      },
    ].map(mainCheckFn);
  });
});
