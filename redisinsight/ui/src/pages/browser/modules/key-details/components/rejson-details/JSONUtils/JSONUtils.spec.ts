import { generatePath, isScalar } from './JSONUtils'

describe('JSONUtils', () => {
  describe('generatePath', () => {
    it('should generate path for Parent and Children', () => {
      const expectPath = "['parent']['children']"
      const parentPath = "['parent']"
      const children = 'children'
      const result = generatePath(parentPath, children)
      expect(expectPath).toEqual(result)
    })
  })

  describe('isScalar', () => {
    it('should return Truthy for scalar variables', () => {
      const string = 'string'
      const number = 123
      const boolean = false

      expect(isScalar(string)).toBeTruthy()
      expect(isScalar(number)).toBeTruthy()
      expect(isScalar(boolean)).toBeTruthy()
    })

    it('should return Falsy for object and array variables', () => {
      const arr = [1, 2, 3]
      const obj = { foo: '' }

      expect(isScalar(arr)).toBeFalsy()
      expect(isScalar(obj)).toBeFalsy()
    })
  })
})
