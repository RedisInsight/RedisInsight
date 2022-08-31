import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import clusterDetails from './clusterDetailsHandlers'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(clusterDetails)
export default handlers
