import { rest, RestHandler } from 'msw'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { ApiEndpoints } from 'uiSrc/constants'

const handlers: RestHandler[] = [
  // delete triggered functions lib
  rest.delete(getMswURL(
    getUrl(INSTANCE_ID_MOCK, ApiEndpoints.TRIGGERED_FUNCTIONS_LIBRARY)
  ),
  async (req, res, ctx) => res(
    ctx.status(200),
  )),
]

export default handlers
