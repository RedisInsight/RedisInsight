import { getFieldTypeOptions } from 'uiSrc/utils'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { FIELD_TYPE_OPTIONS, FieldTypes } from
  'uiSrc/pages/browser/components/create-redisearch-index/constants'

const nameAndVersionToModule = ([name, semanticVersion, version]: any[]) => (
  { name, semanticVersion, version }
)

const ALL_OPTIONS = FIELD_TYPE_OPTIONS.map(({ value, text }) => ({
  value,
  inputDisplay: text,
}))

const WITHOUT_GEOSHAPE_OPTIONS = ALL_OPTIONS.filter(({ value }) => value !== FieldTypes.GEOSHAPE)

const getFieldTypeOptionsTests: any[] = [
  [[['1', '2.8.4'], [RedisDefaultModules.Search, '2.8.4']].map(nameAndVersionToModule), ALL_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.Search, '2.8.3']].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.3'], [RedisDefaultModules.SearchLight, '2.8.4']].map(nameAndVersionToModule), ALL_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.SearchLight, '2.8.3']].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.3'], [RedisDefaultModules.FT, '2.8.4']].map(nameAndVersionToModule), ALL_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.FT, '2.8.3']].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.3'], [RedisDefaultModules.FTL, '2.8.4']].map(nameAndVersionToModule), ALL_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.FTL, '2.8.3']].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.Gears, '2.8.4']].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.Search, undefined, 20804]].map(nameAndVersionToModule), ALL_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.Search, undefined, 20803]].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.SearchLight, undefined, 20804]].map(nameAndVersionToModule), ALL_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.SearchLight, undefined, 20803]].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.SearchLight, undefined, 20804]].map(nameAndVersionToModule), ALL_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.SearchLight, undefined, 20803]].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.FT, undefined, 20804]].map(nameAndVersionToModule), ALL_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.FT, undefined, 20803]].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.FTL, undefined, 20804]].map(nameAndVersionToModule), ALL_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.FTL, undefined, 20803]].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.Gears, undefined, 20804]].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.Gears, undefined, 20803]].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.FTL, '2.8.3', 20803]].map(nameAndVersionToModule), WITHOUT_GEOSHAPE_OPTIONS],
  [[['1', '2.8.4'], [RedisDefaultModules.FTL, '2.8.4', 20804]].map(nameAndVersionToModule), ALL_OPTIONS],
]

describe('getFieldTypeOptions', () => {
  it.each(getFieldTypeOptionsTests)('for input: %s (type), should be output: %s',
    (type, expected) => {
      const result = getFieldTypeOptions(type)
      expect(result).toEqual(expected)
    })
})
