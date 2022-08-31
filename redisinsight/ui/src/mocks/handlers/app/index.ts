import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import info from './infoHandlers'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(info)
export default handlers
