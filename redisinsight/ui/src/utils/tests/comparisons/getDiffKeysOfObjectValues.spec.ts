import { getDiffKeysOfObjectValues } from 'uiSrc/utils'

const getDiffKeysOfObjectValuesTests: any[] = [
  [{}, {}, []],
  [{ key1: '1' }, { key1: '2' }, ['key1']],
  [{ key1: '1' }, { key2: 2 }, ['key1']],
  [{}, { key2: '1' }, []],
  [{ key1: 1 }, { }, ['key1']],
]

describe('getDiffKeysOfObjectValues', () => {
  it.each(getDiffKeysOfObjectValuesTests)('for input: %s, %s should be output: %s',
    (obj1, obj2, expected) => {
      const result = getDiffKeysOfObjectValues(obj1, obj2)
      expect(result).toEqual(expected)
    })
})
