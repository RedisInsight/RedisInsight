import { rest, RestHandler } from 'msw'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { Rdi as RdiInstanceResponse } from 'apiSrc/modules/rdi/models/rdi'

const handlers: RestHandler[] = [
  // fetch rdi instances
  rest.get<RdiInstanceResponse[]>(getMswURL(getUrl(ApiEndpoints.RDI_INSTANCES)), async (_req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'My first integration',
          url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
          lastConnection: new Date(),
          version: '1.2',
          type: 'api',
          username: 'user'
        }
      ])
    )),

  // create rdi instance
  rest.post(getMswURL(ApiEndpoints.RDI_INSTANCES), async (_req, res, ctx) => res(ctx.status(200), ctx.json({}))),

  // update rdi instance
  rest.patch(getMswURL(getUrl('1', ApiEndpoints.RDI_INSTANCES)), async (_req, res, ctx) =>
    res(ctx.status(200), ctx.json({}))),

  // delete rdi instance
  rest.delete(getMswURL(ApiEndpoints.RDI_INSTANCES), async (_req, res, ctx) =>
    res(ctx.status(200), ctx.json({})))
]

export default handlers
