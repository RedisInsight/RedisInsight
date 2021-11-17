import { CommandGroup } from 'uiSrc/constants'

export const FILTER_GROUP_TYPE_OPTIONS = [
  {
    text: 'Server',
    value: CommandGroup.Server,
  },
  {
    text: 'String',
    value: CommandGroup.String,
  },
  {
    text: 'Connection',
    value: CommandGroup.Connection,
  },
  {
    text: 'List',
    value: CommandGroup.List,
  },
  {
    text: 'Zset',
    value: CommandGroup.SortedSet,
  },
  {
    text: 'Cluster',
    value: CommandGroup.Cluster,
  },
  {
    text: 'Generic',
    value: CommandGroup.Generic,
  },
  {
    text: 'Transactions',
    value: CommandGroup.Transactions,
  },
  {
    text: 'Scripting',
    value: CommandGroup.Scripting,
  },
  {
    text: 'Geo',
    value: CommandGroup.Geo,
  },
  {
    text: 'Hash',
    value: CommandGroup.Hash,
  },
  {
    text: 'HyperLogLog',
    value: CommandGroup.HyperLogLog,
  },
  {
    text: 'Pub/Sub',
    value: CommandGroup.PubSub,
  },
  {
    text: 'Set',
    value: CommandGroup.Set,
  },
  {
    text: 'Stream',
    value: CommandGroup.Stream,
  },
  {
    text: 'Search',
    value: CommandGroup.Search,
  },
  {
    text: 'JSON',
    value: CommandGroup.JSON,
  },
  {
    text: 'TimeSeries',
    value: CommandGroup.TimeSeries,
  },
  {
    text: 'Graph',
    value: CommandGroup.Graph,
  },
  {
    text: 'AI',
    value: CommandGroup.AI,
  },
]
