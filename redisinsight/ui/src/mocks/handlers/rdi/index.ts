import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import rdiHandler from './rdiHandler'
import rdiStrategiesHandler from './rdiPipelineStrategiesHandlers'

// @ts-ignore
const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(rdiHandler, rdiStrategiesHandler)
export default handlers
