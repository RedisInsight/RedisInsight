import {
  describe,
  deps,
  getMainCheckFn,
  expect,
} from '../deps';
import { initApiUserProfileNockScope,  } from '../cloud/constants';

const { server, request, localDb } = deps;

// endpoint to test
const id = 'DELETE-ai-messages-test-id'
const endpoint = () => request(server).delete(`/ai/messages`);

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('DELETE /ai/messages', (done) => {
  describe('get history', (done) => {
    [
      {
        name: 'Should delete history with general messages only for null database',
        statusCode: 200,
        endpoint,
        before: async () => {
          const generalMessages = await localDb.generateAiMessages();
          const dbMessages = await localDb.generateAiDatabaseMessages({databaseId: id}, false)
          expect(generalMessages.length).to.eql(2)
          expect(dbMessages.length).to.eql(2)
        },
        after: async () => {
          const allAiMessages = await localDb.getAllAiMessages();
          expect(allAiMessages).to.be.an('array').that.is.not.empty;
          const generalAiMessages = allAiMessages.filter(message => !message.databaseId)
          expect(generalAiMessages).to.be.an('array').that.is.empty;
        }
      },
    ].map(mainCheckFn);
  });
});
