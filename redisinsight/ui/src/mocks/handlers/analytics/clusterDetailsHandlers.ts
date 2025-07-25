import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl } from 'uiSrc/utils'
import { getMswURL } from 'uiSrc/utils/test-utils'
import {
  ClusterDetails,
  Database as DatabaseInstanceResponse,
  ClusterNodeDetailsHealthEnum,
  ClusterNodeDetailsRoleEnum,
} from 'uiSrc/api-client'

export const INSTANCE_ID_MOCK = 'instanceId'

const handlers: RestHandler[] = [
  // useGetClusterDetailsQuery
  rest.get<DatabaseInstanceResponse[]>(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.CLUSTER_DETAILS)),
    async (_req, res, ctx) =>
      res(ctx.status(200), ctx.json(CLUSTER_DETAILS_DATA_MOCK)),
  ),
]

export const CLUSTER_DETAILS_DATA_MOCK: ClusterDetails = {
  state: 'ok',
  slotsAssigned: 16384,
  slotsOk: 16384,
  slotsPFail: 0,
  slotsFail: 0,
  slotsUnassigned: 0,
  statsMessagesSent: 0,
  statsMessagesReceived: 0,
  currentEpoch: 0,
  myEpoch: 0,
  size: 3,
  knownNodes: 3,
  uptimeSec: 1661931600,
  nodes: [
    {
      id: '3',
      host: '3.93.234.244',
      port: 12511,
      role: ClusterNodeDetailsRoleEnum.Primary,
      slots: ['10923-16383'],
      health: ClusterNodeDetailsHealthEnum.Online,
      totalKeys: 0,
      usedMemory: 38448896,
      opsPerSecond: 0,
      connectionsReceived: 15,
      connectedClients: 6,
      commandsProcessed: 114,
      networkInKbps: 0.35,
      networkOutKbps: 3.62,
      cacheHitRatio: 0,
      replicationOffset: 0,
      uptimeSec: 1661931600,
      version: '6.2.6',
      mode: 'standalone',
      replicas: [],
    },
    {
      id: '4',
      host: '44.202.117.57',
      port: 12511,
      role: ClusterNodeDetailsRoleEnum.Primary,
      slots: ['0-5460'],
      health:ClusterNodeDetailsHealthEnum.Online,
      totalKeys: 0,
      usedMemory: 38448896,
      opsPerSecond: 0,
      connectionsReceived: 15,
      connectedClients: 6,
      commandsProcessed: 114,
      networkInKbps: 0.35,
      networkOutKbps: 3.62,
      cacheHitRatio: 0,
      replicationOffset: 0,
      uptimeSec: 1661931600,
      version: '6.2.6',
      mode: 'standalone',
      replicas: [],
    },
    {
      id: '5',
      host: '44.210.115.34',
      port: 12511,
      role: ClusterNodeDetailsRoleEnum.Primary,
      slots: ['5461-10922'],
      health: ClusterNodeDetailsHealthEnum.Online,
      totalKeys: 0,
      usedMemory: 38448896,
      opsPerSecond: 0,
      connectionsReceived: 15,
      connectedClients: 6,
      commandsProcessed: 114,
      networkInKbps: 0.35,
      networkOutKbps: 3.62,
      cacheHitRatio: 0,
      replicationOffset: 0,
      uptimeSec: 1661931600,
      version: '6.2.6',
      mode: 'standalone',
      replicas: [],
    },
  ],
  version: '6.2.6',
  mode: 'standalone',
}

export default handlers
