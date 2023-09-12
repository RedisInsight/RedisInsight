import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import cloud from './cloud'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(cloud)
export default handlers
