import {
  describe,
  deps,
  getMainCheckFn,
  expect,
} from '../deps';
import { initApiUserProfileNockScope,  } from '../cloud/constants';

const { server, request, localDb } = deps;

// endpoint to test
const mockDatabaseId = 'DELETE-ai-messages-test-id'
const endpoint = () => request(server).delete(`/ai/${mockDatabaseId}/messages`);

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('DELETE /ai/:databaseId/messages', (done) => {
  describe('get history', (done) => {
    [
      {
        name: 'Should delete history with database messages only',
        statusCode: 200,
        endpoint,
        before: async () => {
          const generalMessages = await localDb.generateAiMessages();
          const dbMessages = await localDb.generateAiDatabaseMessages({databaseId: mockDatabaseId}, false)
          expect(generalMessages.length).to.eql(2)
          expect(dbMessages.length).to.eql(2)
        },
        after: async () => {
          const allAiMessages = await localDb.getAllAiMessages();
          expect(allAiMessages).to.be.an('array').that.is.not.empty;
          const generalAiMessages = allAiMessages.filter(message => message.databaseId === mockDatabaseId)
          expect(generalAiMessages).to.be.an('array').that.is.empty;
        }
      },
    ].map(mainCheckFn);
  });
});
