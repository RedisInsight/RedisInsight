import { rest, RestHandler } from 'msw'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { OAUTH_CLOUD_CAPI_KEYS_DATA } from 'uiSrc/mocks/data/oauth'

const handlers: RestHandler[] = [
  // fetch cloud capi keys
  rest.get(
    getMswURL(ApiEndpoints.CLOUD_CAPI_KEYS),
    async (_req, res, ctx) => res(
      ctx.status(200),
      ctx.json(OAUTH_CLOUD_CAPI_KEYS_DATA),
    )
  ),
]

export default handlers
