import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import triggeredFunctions from './triggeredFunctionsHandler'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(triggeredFunctions)
export default handlers
