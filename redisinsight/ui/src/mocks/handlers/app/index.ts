import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import info from './infoHandlers'
import telemetry from './telemetryHandlers'
import featureHandlers from './featureHandlers'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(info, telemetry, featureHandlers)
export default handlers
