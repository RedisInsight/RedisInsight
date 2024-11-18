import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import userSettings from './userSettingsHandlers'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(userSettings)
export default handlers
