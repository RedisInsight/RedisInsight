import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl } from 'uiSrc/utils'
import { getMswURL } from 'uiSrc/utils/test-utils'

export const INSTANCE_ID_MOCK = 'instanceId'

const handlers: RestHandler[] = [
  // fetchDBAnalysisReportsHistory
  rest.get(getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.DATABASE_ANALYSIS)),
    async (_req, res, ctx) => res(
      ctx.status(200),
      ctx.json(DB_ANALYSIS_HISTORY_DATA_MOCK),
    ))
]

export const DB_ANALYSIS_HISTORY_DATA_MOCK = [
  { id: 'id_1', createdAt: '1', db: 0 },
  { id: 'id_2', createdAt: '2', db: 0 },
]

export default handlers
