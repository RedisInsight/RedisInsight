import { describe, it, expect, _, before, deps, validateApiCall, requirements } from '../deps';
const { server, request, constants, rte } = deps;
import {
  getRepository,
  repositories
} from '../../helpers/local-db';
import { Socket } from 'socket.io-client';
import { randomBytes }  from 'crypto';
import { getSocket } from '../../helpers/server';

const getClient = async (): Promise<Socket> => {
  return getSocket('');
};

let repo;
describe('WS new recommendations', () => {
  requirements('!rte.sharedData', 'rte.modules.search');

  beforeEach(async () => {
    repo = await getRepository(repositories.DATABASE_RECOMMENDATION);
    await repo.clear();
  });

  before(() => {
    rte.data.truncate();
  });

  it('Should notify about new string recommendations', async () => {
    // generate big key
    await rte.data.executeCommand('set', constants.TEST_STRING_KEY_1, randomBytes(512 * 1024).toString('hex'))

    // Initialize sync by connecting
    const client = await getClient();

    const recommendationsResponse: any = await new Promise((res) => {
      client.on(`recommendation:${constants.TEST_INSTANCE_ID}`, res);

      validateApiCall({
        endpoint: () => request(server).post(`/${constants.API.DATABASES}/${constants.TEST_INSTANCE_ID}/keys/get-metadata`),
        data: {
          keys: [constants.TEST_STRING_KEY_1],
        },
      });
    })


    expect(recommendationsResponse.recommendations.length).to.eq(1);
    expect(recommendationsResponse.recommendations[0].name).to.eq('searchString');
    expect(recommendationsResponse.recommendations[0].databaseId).to.eq(constants.TEST_INSTANCE_ID);
    expect(recommendationsResponse.recommendations[0].read).to.eq(false);
    expect(recommendationsResponse.recommendations[0].disabled).to.eq(false);
    expect(recommendationsResponse.totalUnread).to.eq(1);
  });
});
