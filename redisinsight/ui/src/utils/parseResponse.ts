import { find, map, sortBy, omit, forEach, isNull } from 'lodash'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { initialStateSentinelStatus } from 'uiSrc/slices/instances/sentinel'

import {
  CreateSentinelDatabaseResponse as AddSentinelMasterResponse,
  SentinelMaster,
} from 'uiSrc/api-client'

const DEFAULT_NODE_ID = 'standalone'

export const parseMastersSentinel = (
  masters: SentinelMaster[],
): ModifiedSentinelMaster[] =>
  // @ts-expect-error TODO: check this type mismatch
  map(sortBy(masters, 'name'), (master, i) => ({
    ...initialStateSentinelStatus,
    ...master,
    id: `${i + 1}`,
    alias: '',
    username: '',
    password: '',
  }))

export const parseAddedMastersSentinel = (
  masters: ModifiedSentinelMaster[],
  statuses: AddSentinelMasterResponse[],
): ModifiedSentinelMaster[] =>
  // @ts-expect-error TODO: check this type mismatch
  sortBy(masters, 'message').map((master) => ({
    ...master,
    ...find(statuses, (status) => master.name === status.name),
    loading: false,
  }))

export const parseKeysListResponse = (prevShards: any = {}, data: any = []) => {
  const shards = { ...prevShards }

  const result = {
    nextCursor: '0',
    total: 0,
    scanned: 0,
    keys: [],
    shardsMeta: {},
  }

  data.forEach((node: any) => {
    const id = node.host ? `${node.host}:${node.port}` : DEFAULT_NODE_ID
    const shard = (() => {
      if (!shards[id]) {
        shards[id] = omit(node, 'keys')
      } else {
        shards[id] = {
          ...omit(node, 'keys'),
          scanned: shards[id].scanned + node.scanned,
        }
      }
      return shards[id]
    })()

    // summarize shard values
    if (
      (shard.scanned > shard.total || shard.cursor === 0) &&
      !isNull(shard.total)
    ) {
      shard.scanned = shard.total
    }

    // result.keys.push(...node.keys)
    result.keys = result.keys.concat(node.keys)
  })

  // summarize result numbers
  const nextCursor: any[] = []
  forEach(shards, (shard, id) => {
    if (shard.total === null) {
      result.total = shard.total
    } else {
      // we don't know how many keys we lost in total = null shard
      result.total = isNull(result.total) ? null : result.total + shard.total
    }
    result.scanned += shard.scanned

    // ignore already scanned shards on get more call
    if (shard.cursor === 0) {
      return
    }

    if (id === DEFAULT_NODE_ID) {
      nextCursor.push(shard.cursor)
    } else {
      nextCursor.push(`${id}@${shard.cursor}`)
    }
  })

  result.nextCursor = nextCursor.join('||') || '0'
  result.shardsMeta = shards

  return result
}
