import { KeyTypes, KeyValueFormat, ModulesKeyTypes } from 'uiSrc/constants'
import UnicodeIconDark from 'uiSrc/assets/img/workbench/text_view_dark.svg'
import UnicodeIconLight from 'uiSrc/assets/img/workbench/text_view_light.svg'

export const KEY_VALUE_FORMATTER_OPTIONS = [
  {
    text: 'Unicode',
    iconDark: UnicodeIconDark,
    iconLight: UnicodeIconLight,
    value: KeyValueFormat.Unicode,
  },
  {
    text: 'JSON',
    iconDark: 'kqlSelector',
    iconLight: 'kqlSelector',
    value: KeyValueFormat.JSON,
  },
  {
    text: 'Msgpack',
    iconDark: 'kqlSelector',
    iconLight: 'kqlSelector',
    value: KeyValueFormat.Msgpack,
  },
  {
    text: 'HEX',
    iconDark: 'kqlSelector',
    iconLight: 'kqlSelector',
    value: KeyValueFormat.HEX,
  },
]

export const KEY_VALUE_JSON_FORMATTER_OPTIONS = []

export const getKeyValueFormatterOptions = (viewFormat?: KeyTypes | ModulesKeyTypes) => (
  viewFormat !== KeyTypes.ReJSON
    ? [...KEY_VALUE_FORMATTER_OPTIONS]
    : [...KEY_VALUE_FORMATTER_OPTIONS].filter((option) =>
      KEY_VALUE_JSON_FORMATTER_OPTIONS.indexOf(option.value) !== -1)
)
