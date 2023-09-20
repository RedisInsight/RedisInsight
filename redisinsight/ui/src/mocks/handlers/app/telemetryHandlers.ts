import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'

const handlers: RestHandler[] = [
  // sendEventTelemetry
  rest.post(getMswURL(ApiEndpoints.ANALYTICS_SEND_EVENT), async (req, res, ctx) => res(
    ctx.status(200),
  )),
  // sendPageViewTelemetry
  rest.post(getMswURL(ApiEndpoints.ANALYTICS_SEND_PAGE), async (req, res, ctx) => res(
    ctx.status(200),
  ))
]

export default handlers
