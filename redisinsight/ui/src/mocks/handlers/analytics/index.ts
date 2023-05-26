import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import clusterDetails from './clusterDetailsHandlers'
import dbAnalysisHistory from './dbAnalysisHistoryHandlers'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(clusterDetails, dbAnalysisHistory)
export default handlers
