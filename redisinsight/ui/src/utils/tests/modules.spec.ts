import { IDatabaseModule, sortModules } from 'uiSrc/utils/modules'

const modules1: IDatabaseModule[] = [
  { moduleName: 'RedisJSON', abbreviation: 'RS' },
  { moduleName: 'My1Module', abbreviation: 'MD' },
  { moduleName: 'RediSearch', abbreviation: 'RS' },
]
const modules2: IDatabaseModule[] = [
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: 'RedisBloom', abbreviation: 'RS' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: 'MycvModule', abbreviation: 'MC' },
  { moduleName: 'My1Module', abbreviation: 'MD' },
  { moduleName: 'RedisJSON', abbreviation: 'RS' },
  { moduleName: 'My2Modul2e', abbreviation: 'MX' },
  { moduleName: 'RediSearch', abbreviation: 'RS' },
]

const result1: IDatabaseModule[] = [
  { moduleName: 'RediSearch', abbreviation: 'RS' },
  { moduleName: 'RedisJSON', abbreviation: 'RS' },
  { moduleName: 'My1Module', abbreviation: 'MD' }
]

const result2: IDatabaseModule[] = [
  { moduleName: 'RediSearch', abbreviation: 'RS' },
  { moduleName: 'RedisJSON', abbreviation: 'RS' },
  { moduleName: 'RedisBloom', abbreviation: 'RS' },
  { moduleName: 'MycvModule', abbreviation: 'MC' },
  { moduleName: 'My1Module', abbreviation: 'MD' },
  { moduleName: 'My2Modul2e', abbreviation: 'MX' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
]

describe('sortModules', () => {
  it('should proper sort modules list', () => {
    expect(sortModules(modules1)).toEqual(result1)
    expect(sortModules(modules2)).toEqual(result2)
  })
})
