import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { DatabaseRecommendationsResponse as RecommendationResponse } from 'uiSrc/api-client'
import { INSTANCE_ID_MOCK } from '../instances/instancesHandlers'

export const RECOMMENDATIONS_DATA_MOCK = {
  recommendations: [
    { name: 'redisSearch', id: 'id', read: false, hide: false },
    { name: 'bigHashes', id: 'id2', read: false, hide: true },
  ],
  totalUnread: 1,
}

const handlers: RestHandler[] = [
  // fetchRecommendationsAction
  rest.get<RecommendationResponse>(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.RECOMMENDATIONS)),
    async (req, res, ctx) =>
      res(ctx.status(200), ctx.json(RECOMMENDATIONS_DATA_MOCK)),
  ),
  rest.delete(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.RECOMMENDATIONS)),
    async (req, res, ctx) => res(ctx.status(200)),
  ),
]

export default handlers
