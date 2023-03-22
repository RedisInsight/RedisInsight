import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { Recommendation as RecommendationResponse } from 'apiSrc/modules/database-recommendations/models/recommendation'
import { INSTANCE_ID_MOCK } from '../instances/instancesHandlers'

export const RECOMMENDATIONS_DATA_MOCK = {
  recommendations: [{ name: 'rediSearch', id: 'id', read: false }],
  totalUnread: 1
}

const handlers: RestHandler[] = [
  // fetchRecommendationsAction
  rest.get<RecommendationResponse>(getMswURL(
    getUrl(INSTANCE_ID_MOCK, ApiEndpoints.RECOMMENDATIONS)
  ), async (req, res, ctx) => res(
    ctx.status(200),
    ctx.json(RECOMMENDATIONS_DATA_MOCK),
  ))
]

export default handlers
