import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { Database as DatabaseInstanceResponse } from 'apiSrc/modules/database/models/database'

export const APP_INFO_DATA_MOCK = {
  id: 'id1',
  createDateTime: '2000-01-01T00:00:00.000Z',
  appVersion: '2.0.0',
  osPlatform: 'win32',
  buildType: 'ELECTRON'
}

const handlers: RestHandler[] = [
  // fetchServerInfo
  rest.get<DatabaseInstanceResponse[]>(getMswURL(ApiEndpoints.INFO), async (_req, res, ctx) => res(
    ctx.status(200),
    ctx.json(APP_INFO_DATA_MOCK),
  ))
]

export default handlers
