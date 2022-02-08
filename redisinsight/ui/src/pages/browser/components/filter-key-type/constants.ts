import {
  GROUP_TYPES_COLORS,
  KeyTypes,
  UnsupportedKeyTypes,
} from 'uiSrc/constants'

export const FILTER_KEY_TYPE_OPTIONS = [
  {
    text: 'Hash',
    value: KeyTypes.Hash,
    color: GROUP_TYPES_COLORS[KeyTypes.Hash],
  },
  {
    text: 'Sorted Set',
    value: KeyTypes.ZSet,
    color: GROUP_TYPES_COLORS[KeyTypes.ZSet],
  },
  {
    text: 'Set',
    value: KeyTypes.Set,
    color: GROUP_TYPES_COLORS[KeyTypes.Set],
  },
  {
    text: 'String',
    value: KeyTypes.String,
    color: GROUP_TYPES_COLORS[KeyTypes.String],
  },
  {
    text: 'List',
    value: KeyTypes.List,
    color: GROUP_TYPES_COLORS[KeyTypes.List],
  },
  {
    text: 'JSON',
    value: KeyTypes.ReJSON,
    color: GROUP_TYPES_COLORS[KeyTypes.ReJSON],
  },
  {
    text: 'STREAM',
    value: UnsupportedKeyTypes.Stream,
    color: GROUP_TYPES_COLORS[UnsupportedKeyTypes.Stream],
  },
  {
    text: 'GRAPH',
    value: UnsupportedKeyTypes.Graph,
    color: GROUP_TYPES_COLORS[UnsupportedKeyTypes.Graph],
  },
  {
    text: 'TS',
    value: UnsupportedKeyTypes.TimeSeries,
    color: GROUP_TYPES_COLORS[UnsupportedKeyTypes.TimeSeries],
  },
]
