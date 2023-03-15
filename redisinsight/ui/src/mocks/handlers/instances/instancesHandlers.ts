import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { ConnectionType, Instance } from 'uiSrc/slices/interfaces'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { Database as DatabaseInstanceResponse } from 'apiSrc/modules/database/models/database'
import { ExportDatabase } from 'apiSrc/modules/database/models/export-database'

export const INSTANCE_ID_MOCK = 'instanceId'
export const INSTANCES_MOCK: Instance[] = [
  {
    id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
    host: 'localhost',
    port: 6379,
    name: 'localhost',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    modules: [],
    uoeu: 123,
    lastConnection: new Date('2021-04-22T09:03:56.917Z'),
  },
  {
    id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
    host: 'localhost',
    port: 12000,
    name: 'oea123123',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    modules: [],
    tls: {
      verifyServerCert: true,
      caCertId: '70b95d32-c19d-4311-bb24-e684af12cf15',
      clientCertPairId: '70b95d32-c19d-4311-b23b24-e684af12cf15',
    },
  },
  {
    id: 'b83a3932-e95f-4f09-9d8a-55079f400186',
    host: 'localhost',
    port: 5005,
    name: 'sentinel',
    username: null,
    password: null,
    connectionType: ConnectionType.Sentinel,
    nameFromProvider: null,
    lastConnection: new Date('2021-04-22T18:40:44.031Z'),
    modules: [],
    endpoints: [
      {
        host: 'localhost',
        port: 5005,
      },
      {
        host: '127.0.0.1',
        port: 5006,
      },
    ],
    sentinelMaster: {
      name: 'mymaster',
    },
  },
]

const handlers: RestHandler[] = [
  // fetchInstancesAction
  rest.get<DatabaseInstanceResponse[]>(getMswURL(ApiEndpoints.DATABASES), async (req, res, ctx) => res(
    ctx.status(200),
    ctx.json(INSTANCES_MOCK),
  )),
  rest.post<ExportDatabase>(getMswURL(ApiEndpoints.DATABASES_EXPORT), async (req, res, ctx) => res(
    ctx.status(200),
    ctx.json(INSTANCES_MOCK),
  ))
]

// rest.post(`${ApiEndpoints.INSTANCE}`, (req, res, ctx) => {
//   const { username } = req.body

//   return res(
//     ctx.json({
//       id: 'f79e82e8-c34a-4dc7-a49e-9fadc0979fda',
//       username,
//       firstName: 'John',
//       lastName: 'Maverick',
//     }),
//   )
// }),

export default handlers
