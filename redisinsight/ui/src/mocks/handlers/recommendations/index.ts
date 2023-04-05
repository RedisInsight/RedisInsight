import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import recommendations from './recommendationsHandler'
import readRecommendations from './recommendationsReadHandler'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(recommendations, readRecommendations)
export default handlers
