import {
  describe,
  deps,
  Joi,
  getMainCheckFn,
  expect,
} from '../deps';
import { initApiUserProfileNockScope,  } from '../cloud/constants';
import { AiMessageType } from 'src/modules/ai/messages/models';
import { mockAiDatabaseId } from 'src/__mocks__';

const { server, request, localDb } = deps;

// endpoint to test
const endpoint = (dbId?: string) => request(server).get(`/ai/${dbId || mockAiDatabaseId}/messages`);

const responseSchema = Joi.array().items(Joi.object().keys({
  id: Joi.string().required(),
  type: Joi.string().allow(AiMessageType.HumanMessage, AiMessageType.AiMessage).required(),
  databaseId: Joi.string().allow(null).required(),
  accountId: Joi.string().required(),
  conversationId: Joi.string().allow(null),
  content: Joi.string().required(),
  createdAt: Joi.date().required(),
  steps: Joi.array().allow(null),
})).required();

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('GET /ai/:databaseId/messages', (done) => {
  describe('get history', (done) => {
    [
      {
        name: 'Should return history with messages for a given database',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(2);
          expect(body.filter(el => el.databaseId == mockAiDatabaseId).length).to.eql(2)
        },
        endpoint,
        before: async () => {
          await localDb.generateAiDatabaseMessages({ databaseId: mockAiDatabaseId });
        },
      },
      {
        name: 'Should not return messages of other dbId',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(0);
          expect(body.filter(el => el.databaseId === mockAiDatabaseId).length).to.eql(0)
        },
        endpoint: () => endpoint('NO_AI_MESSAGES_TEST_DB_ID'),
        before: async () => {
          await localDb.generateAiDatabaseMessages({ databaseId: mockAiDatabaseId});
        },
      },
    ].map(mainCheckFn);
  });
});
