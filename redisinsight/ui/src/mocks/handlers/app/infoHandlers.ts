import { DatabaseInstanceResponse } from 'apiSrc/modules/instances/dto/database-instance.dto'
import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'

export const APP_INFO_DATA_MOCK = {
  id: 'id1',
  createDateTime: '2000-01-01T00:00:00.000Z',
  appVersion: '2.0.0',
  osPlatform: 'win32',
  buildType: 'ELECTRON'
}

const handlers: RestHandler[] = [
  // useGetClusterDetailsQuery
  rest.get<DatabaseInstanceResponse[]>(getMswURL(ApiEndpoints.INFO), async (req, res, ctx) => res(
    ctx.status(200),
    ctx.json(APP_INFO_DATA_MOCK),
  ))
]

export default handlers
