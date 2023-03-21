import { describe, deps, before, getMainCheckFn } from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants } = deps;

const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
) =>
  request(server).get(`/${constants.API.DATABASES}/${instanceId}/recommendations`);

const responseSchema = Joi.object({
  recommendations: Joi.array().items(Joi.object({
    read: Joi.boolean().required(),
    id: Joi.string().required(),
    name: Joi.string().required(),
  })),
  totalUnread: Joi.number().required(),
});

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /databases/:id/recommendations', () => {
  before(async () => await localDb.generateDatabaseRecommendations({
      databaseId: constants.TEST_INSTANCE_ID,
    }, 3, true),
  );

  [
    {
      name: 'Should get list of database recommendations',
      responseSchema,
    },
  ].map(mainCheckFn);
});
