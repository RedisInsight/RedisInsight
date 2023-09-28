import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import info from './infoHandlers'
import telemetry from './telemetryHandlers'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(info, telemetry)
export default handlers
