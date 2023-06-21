import { rest, RestHandler } from 'msw'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { ApiEndpoints } from 'uiSrc/constants'

export const TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA = {
  apiVersion: '1.2',
  code: 'code',
  configuration: 'config',
  functions: [
    { name: 'foo', type: 'functions' },
    { name: 'foo1', type: 'functions' },
    { name: 'foo2', type: 'cluster_functions' },
    { name: 'foo3', type: 'keyspace_triggers' },
  ],
  name: 'lib',
  pendingJobs: 12,
  user: 'default',
}

const handlers: RestHandler[] = [
  // fetch triggered functions lib details
  rest.post(getMswURL(
    getUrl(INSTANCE_ID_MOCK, ApiEndpoints.TRIGGERED_FUNCTIONS_GET_LIBRARY)
  ),
  async (req, res, ctx) => res(
    ctx.status(200),
    ctx.json(TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA),
  )),
]

export default handlers
