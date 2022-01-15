import {
  GROUP_TYPES_COLORS,
  DataTypes,
  UnsupportedDataTypes,
} from 'uiSrc/constants'

export const FILTER_DATA_TYPE_OPTIONS = [
  {
    text: 'Hash',
    value: DataTypes.Hash,
    color: GROUP_TYPES_COLORS[DataTypes.Hash],
  },
  {
    text: 'Sorted Set',
    value: DataTypes.ZSet,
    color: GROUP_TYPES_COLORS[DataTypes.ZSet],
  },
  {
    text: 'Set',
    value: DataTypes.Set,
    color: GROUP_TYPES_COLORS[DataTypes.Set],
  },
  {
    text: 'String',
    value: DataTypes.String,
    color: GROUP_TYPES_COLORS[DataTypes.String],
  },
  {
    text: 'List',
    value: DataTypes.List,
    color: GROUP_TYPES_COLORS[DataTypes.List],
  },
  {
    text: 'JSON',
    value: DataTypes.ReJSON,
    color: GROUP_TYPES_COLORS[DataTypes.ReJSON],
  },
  {
    text: 'STREAM',
    value: UnsupportedDataTypes.Stream,
    color: GROUP_TYPES_COLORS[UnsupportedDataTypes.Stream],
  },
  {
    text: 'GRAPH',
    value: UnsupportedDataTypes.Graph,
    color: GROUP_TYPES_COLORS[UnsupportedDataTypes.Graph],
  },
  {
    text: 'TS',
    value: UnsupportedDataTypes.TimeSeries,
    color: GROUP_TYPES_COLORS[UnsupportedDataTypes.TimeSeries],
  },
]
