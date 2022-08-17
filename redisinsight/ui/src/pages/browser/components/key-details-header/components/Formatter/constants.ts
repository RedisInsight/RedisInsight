import { KeyTypes, KeyValueFormat, ModulesKeyTypes } from 'uiSrc/constants'

export const KEY_VALUE_FORMATTER_OPTIONS = [
  {
    text: 'Unicode',
    value: KeyValueFormat.Unicode,
  },
  {
    text: 'ASCII',
    value: KeyValueFormat.ASCII,
  },
  {
    text: 'HEX',
    value: KeyValueFormat.HEX,
  },
  {
    text: 'Binary',
    value: KeyValueFormat.Binary,
  },
  {
    text: 'JSON',
    value: KeyValueFormat.JSON,
  },
  {
    text: 'Msgpack',
    value: KeyValueFormat.Msgpack,
  },
  {
    text: 'PHP Unserialize',
    value: KeyValueFormat.PHP,
  },
]

export const KEY_VALUE_JSON_FORMATTER_OPTIONS = []

export const getKeyValueFormatterOptions = (viewFormat?: KeyTypes | ModulesKeyTypes) => (
  viewFormat !== KeyTypes.ReJSON
    ? [...KEY_VALUE_FORMATTER_OPTIONS]
    : [...KEY_VALUE_FORMATTER_OPTIONS].filter((option) =>
      KEY_VALUE_JSON_FORMATTER_OPTIONS.indexOf(option.value) !== -1)
)
