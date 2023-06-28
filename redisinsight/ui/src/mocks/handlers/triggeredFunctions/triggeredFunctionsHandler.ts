import { rest, RestHandler } from 'msw'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { ApiEndpoints } from 'uiSrc/constants'
import {
  TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA,
  TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA,
  TRIGGERED_FUNCTIONS_LIBRARIES_LIST_MOCKED_DATA,
} from 'uiSrc/mocks/data/triggeredFunctions'

const handlers: RestHandler[] = [
  // fetch libraries list
  rest.get(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.TRIGGERED_FUNCTIONS_LIBRARIES)),
    async (_req, res, ctx) => res(
      ctx.status(200),
      ctx.json(TRIGGERED_FUNCTIONS_LIBRARIES_LIST_MOCKED_DATA),
    )
  ),
  // fetch triggered functions lib details
  rest.post(getMswURL(
    getUrl(INSTANCE_ID_MOCK, ApiEndpoints.TRIGGERED_FUNCTIONS_GET_LIBRARY)
  ),
  async (_req, res, ctx) => res(
    ctx.status(200),
    ctx.json(TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA),
  )),
  // fetch functions list
  rest.get(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.TRIGGERED_FUNCTIONS_FUNCTIONS)),
    async (_req, res, ctx) => res(
      ctx.status(200),
      ctx.json(TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA),
    )
  )
]

export default handlers
