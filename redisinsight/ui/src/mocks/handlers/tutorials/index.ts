import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import tutorials from './tutorialsHandlers'

// @ts-ignore
const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(tutorials)
export default handlers
