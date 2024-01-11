import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import rdiHandler from './rdiHandler'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(rdiHandler)
export default handlers
