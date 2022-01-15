import { CommandGroup } from './commands'

export enum DataTypes {
  Hash = 'hash',
  List = 'list',
  Set = 'set',
  ZSet = 'zset',
  String = 'string',
  ReJSON = 'ReJSON-RL',
  JSON = 'json',
}

export enum UnsupportedDataTypes {
  Graph = 'graphdata',
  Stream = 'stream',
  TimeSeries = 'TSDB-TYPE',
}

export const GROUP_TYPES_DISPLAY = Object.freeze({
  [DataTypes.Hash]: 'Hash',
  [DataTypes.List]: 'List',
  [DataTypes.Set]: 'Set',
  [DataTypes.ZSet]: 'Sorted Set',
  [DataTypes.String]: 'String',
  [DataTypes.ReJSON]: 'JSON',
  [DataTypes.JSON]: 'JSON',
  [UnsupportedDataTypes.Stream]: 'Stream',
  [UnsupportedDataTypes.Graph]: 'GRAPH',
  [UnsupportedDataTypes.TimeSeries]: 'TS',
  [CommandGroup.Bitmap]: 'Bitmap',
  [CommandGroup.Cluster]: 'Cluster',
  [CommandGroup.Connection]: 'Connection',
  [CommandGroup.Geo]: 'Geo',
  [CommandGroup.Generic]: 'Generic',
  [CommandGroup.PubSub]: 'Pub/Sub',
  [CommandGroup.Scripting]: 'Scripting',
  [CommandGroup.Transactions]: 'Transactions',
  [CommandGroup.TimeSeries]: 'TimeSeries',
  [CommandGroup.Server]: 'Server',
  [CommandGroup.SortedSet]: 'Sorted Set',
  [CommandGroup.HyperLogLog]: 'HyperLogLog',
})

// Enums don't allow to use dynamic key
export const GROUP_TYPES_COLORS = Object.freeze({
  [DataTypes.Hash]: 'var(--typeHashColor)',
  [DataTypes.List]: 'var(--typeListColor)',
  [DataTypes.Set]: 'var(--typeSetColor)',
  [DataTypes.ZSet]: 'var(--typeZSetColor)',
  [DataTypes.String]: 'var(--typeStringColor)',
  [DataTypes.ReJSON]: 'var(--typeReJSONColor)',
  [DataTypes.JSON]: 'var(--typeReJSONColor)',
  [UnsupportedDataTypes.Stream]: 'var(--typeStreamColor)',
  [UnsupportedDataTypes.Graph]: 'var(--typeGraphColor)',
  [UnsupportedDataTypes.TimeSeries]: 'var(--typeTimeSeriesColor)',
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

export const DATA_TYPES_ACTIONS = Object.freeze({
  [DataTypes.Hash]: {
    addItems: {
      name: 'Add Fields',
    },
  },
  [DataTypes.List]: {
    addItems: {
      name: 'Add Element',
    },
    removeItems: {
      name: 'Remove Elements',
    },
  },
  [DataTypes.Set]: {
    addItems: {
      name: 'Add Members',
    },
  },
  [DataTypes.ZSet]: {
    addItems: {
      name: 'Add Members',
    },
  },
  [DataTypes.String]: {
    editItem: {
      name: 'Edit Value',
    },
  },
  [DataTypes.ReJSON]: {},
})

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const LENGTH_NAMING_BY_TYPE = Object.freeze({
  [UnsupportedDataTypes.Graph]: 'Nodes',
  [UnsupportedDataTypes.TimeSeries]: 'Samples',
  [UnsupportedDataTypes.Stream]: 'Entries'
})
