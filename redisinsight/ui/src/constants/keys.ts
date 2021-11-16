import { CommandGroup } from './commands'

export enum KeyTypes {
  Hash = 'hash',
  List = 'list',
  Set = 'set',
  ZSet = 'zset',
  String = 'string',
  ReJSON = 'ReJSON-RL',
  JSON = 'json',
}

export enum UnsupportedKeyTypes {
  Graph = 'graphdata',
  Stream = 'stream',
  TimeSeries = 'TSDB-TYPE',
}

export const GROUP_TYPES_DISPLAY = Object.freeze({
  [KeyTypes.Hash]: 'Hash',
  [KeyTypes.List]: 'List',
  [KeyTypes.Set]: 'Set',
  [KeyTypes.ZSet]: 'Zset',
  [KeyTypes.String]: 'String',
  [KeyTypes.ReJSON]: 'JSON',
  [KeyTypes.JSON]: 'JSON',
  [UnsupportedKeyTypes.Stream]: 'Stream',
  [UnsupportedKeyTypes.Graph]: 'GRAPH',
  [UnsupportedKeyTypes.TimeSeries]: 'TS',
  [CommandGroup.Bitmap]: 'Bitmap',
  [CommandGroup.Cluster]: 'Cluster',
  [CommandGroup.Connection]: 'Connection',
  [CommandGroup.Geo]: 'Geo',
  [CommandGroup.Generic]: 'Generic',
  [CommandGroup.PubSub]: 'PubSub',
  [CommandGroup.Scripting]: 'Scripting',
  [CommandGroup.Transactions]: 'Transactions',
  [CommandGroup.Server]: 'Server',
  [CommandGroup.SortedSet]: 'ZSet',
  [CommandGroup.HyperLogLog]: 'HyperLogLog',
})

// Enums don't allow to use dynamic key
export const GROUP_TYPES_COLORS = Object.freeze({
  [KeyTypes.Hash]: 'var(--typeHashColor)',
  [KeyTypes.List]: 'var(--typeListColor)',
  [KeyTypes.Set]: 'var(--typeSetColor)',
  [KeyTypes.ZSet]: 'var(--typeZSetColor)',
  [KeyTypes.String]: 'var(--typeStringColor)',
  [KeyTypes.ReJSON]: 'var(--typeReJSONColor)',
  [KeyTypes.JSON]: 'var(--typeReJSONColor)',
  [UnsupportedKeyTypes.Stream]: 'var(--typeStreamColor)',
  [UnsupportedKeyTypes.Graph]: 'var(--typeGraphColor)',
  [UnsupportedKeyTypes.TimeSeries]: 'var(--typeTimeSeriesColor)',
  [CommandGroup.SortedSet]: 'var(--groupSortedSetColor)',
  [CommandGroup.Bitmap]: 'var(--groupBitmapColor)',
  [CommandGroup.Cluster]: 'var(--groupClusterColor)',
  [CommandGroup.Connection]: 'var(--groupConnectionColor)',
  [CommandGroup.Geo]: 'var(--groupGeoColor)',
  [CommandGroup.Generic]: 'var(--groupGenericColor)',
  [CommandGroup.PubSub]: 'var(--groupPubSubColor)',
  [CommandGroup.Scripting]: 'var(--groupScriptingColor)',
  [CommandGroup.Transactions]: 'var(--groupTransactionsColor)',
  [CommandGroup.Server]: 'var(--groupServerColor)',
  [CommandGroup.HyperLogLog]: 'var(--groupHyperLolLogColor)',
})

export const KEY_TYPES_ACTIONS = Object.freeze({
  [KeyTypes.Hash]: {
    addItems: {
      name: 'Add Fields',
    },
  },
  [KeyTypes.List]: {
    addItems: {
      name: 'Add Element',
    },
    removeItems: {
      name: 'Remove Elements',
    },
  },
  [KeyTypes.Set]: {
    addItems: {
      name: 'Add Members',
    },
  },
  [KeyTypes.ZSet]: {
    addItems: {
      name: 'Add Members',
    },
  },
  [KeyTypes.String]: {
    editItem: {
      name: 'Edit Value',
    },
  },
  [KeyTypes.ReJSON]: {},
})

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const LENGTH_NAMING_BY_TYPE = Object.freeze({
  [UnsupportedKeyTypes.Graph]: 'Nodes',
  [UnsupportedKeyTypes.TimeSeries]: 'Samples',
  [UnsupportedKeyTypes.Stream]: 'Entries'
})
