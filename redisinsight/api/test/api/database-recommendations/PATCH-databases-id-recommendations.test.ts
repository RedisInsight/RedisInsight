import { describe, it, deps, expect, validateApiCall } from '../deps';
import { getRepository, repositories } from '../../helpers/local-db';
const { localDb, request, server, constants } = deps;

const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
) =>
  request(server).patch(`/${constants.API.DATABASES}/${instanceId}/recommendations/read`);

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    }
  });
};

let repo;
describe('PATCH /recommendations/read', () => {
  beforeEach(async () => {
    repo = await getRepository(repositories.DATABASE_RECOMMENDATION);
    await localDb.generateDatabaseRecommendations({
      databaseId: constants.TEST_INSTANCE_ID,
    }, true);
  });

  [
    {
      name: 'Should set all recommendations into read state',
      before: async () => {
        const recommendations = await repo.createQueryBuilder().getMany();
        expect(recommendations.filter(recommendation => {
          return recommendation.read === false;
        }).length).to.gte(1);
      },
      after: async () => {
        const recommendations = await repo.createQueryBuilder().getMany();
        expect(recommendations.filter(recommendation => {
          return recommendation.read === false;
        }).length).to.eq(0);
      },
    },
  ].map(mainCheckFn);
});
