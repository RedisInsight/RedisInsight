import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'

export const USER_SETTINGS_DATA_MOCK = {
  theme: 'DARK',
  dateFormat: 'YYYY-MM-DD',
  timezone: 'UTC',
  batchSize: 5,
  scanThreshold: 10_000,
  agreements: {
    eula: true,
    analytics: true,
    notifications: true,
    version: '1.0.0',
  },
}

const handlers: RestHandler[] = [
  rest.get(getMswURL(ApiEndpoints.SETTINGS), async (_req, res, ctx) => res(
    ctx.status(200),
    ctx.json(USER_SETTINGS_DATA_MOCK),
  ))
]

export default handlers
