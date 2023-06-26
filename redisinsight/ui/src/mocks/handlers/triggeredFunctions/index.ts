import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import triggeredFunctions from './triggeredFunctionsHandler'
import deleteLibrary from './triggeredFunctionsDeleteHandler'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(triggeredFunctions, deleteLibrary)
export default handlers
