import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import instances from './instancesHandlers'
import caCerts from './caCertsHandlers'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(
  instances,
  caCerts,
)
export default handlers
