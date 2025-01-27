import { rest, RestHandler } from 'msw'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { OAUTH_CLOUD_CAPI_KEYS_DATA } from 'uiSrc/mocks/data/oauth'

export const CLOUD_ME_DATA_MOCK = {
  id: 66830,
  name: 'John Smith',
  currentAccountId: 71011,
  accounts: [
    {
      id: 71011,
      name: 'Test account'
    }
  ],
  data: {}
}

const handlers: RestHandler[] = [
  // fetch cloud capi keys
  rest.get(
    getMswURL(ApiEndpoints.CLOUD_CAPI_KEYS),
    async (_req, res, ctx) => res(
      ctx.status(200),
      ctx.json(OAUTH_CLOUD_CAPI_KEYS_DATA),
    )
  ),

  // fetch user profile
  rest.get(
    getMswURL(ApiEndpoints.CLOUD_ME),
    async (_req, res, ctx) => res(
      ctx.status(200),
      ctx.json(CLOUD_ME_DATA_MOCK),
    )
  ),
]

export default handlers
