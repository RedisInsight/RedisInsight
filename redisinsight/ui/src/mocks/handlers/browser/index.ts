import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import redisearch from './redisearchHandlers'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(
  redisearch,
)
export default handlers
