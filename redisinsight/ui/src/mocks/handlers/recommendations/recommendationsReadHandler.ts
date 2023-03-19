import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { Recommendation as RecommendationResponse } from 'apiSrc/modules/database-recommendations/models/recommendation'
import { INSTANCE_ID_MOCK } from '../instances/instancesHandlers'

const EMPTY_RECOMMENDATIONS_MOCK = {
  recommendations: [],
  totalUnread: 0,
}

const handlers: RestHandler[] = [
  // readRecommendationsAction
  rest.patch<RecommendationResponse>(getMswURL(
    getUrl(INSTANCE_ID_MOCK, ApiEndpoints.RECOMMENDATIONS_READ)
  ), async (req, res, ctx) => res(
    ctx.status(200),
    ctx.json(EMPTY_RECOMMENDATIONS_MOCK),
  ))
]

export default handlers
