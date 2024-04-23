import { generatePath, getBrackets, isRealArray, isRealObject, isScalar, isValidKey, wrapPath } from './utils'
import { ObjectTypes } from '../interfaces'

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

  describe('wrapPath', () => {
    it('should properly wrap path', () => {
      expect(wrapPath('"key"')).toEqual('["key"]')
      expect(wrapPath('"ke\\"y"')).toEqual("['ke\"y']")
      expect(wrapPath('"key"', 'path')).toEqual('path["key"]')
      expect(wrapPath('"key\\""', 'path')).toEqual("path['key\"']")
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
      expect(isScalar([1, 2, 3] as any)).toBeFalsy()
      expect(isScalar({ foo: '' } as any)).toBeFalsy()
    })
  })

  describe('isRealObject', () => {
    it('should properly check for an object', () => {
      expect(isRealObject({})).toBeTruthy()
      expect(isRealObject([], 'object')).toBeTruthy()
      expect(isRealObject([])).toBeFalsy()
      expect(isRealObject(null)).toBeFalsy()
      expect(isRealObject(undefined)).toBeFalsy()
    })
  })

  describe('isRealArray', () => {
    it('should properly check for an array', () => {
      expect(isRealArray([])).toBeTruthy()
      expect(isRealArray([], 'array')).toBeTruthy()
      expect(isRealArray({}, 'array')).toBeTruthy()
      expect(isRealArray({})).toBeFalsy()
      expect(isRealArray('')).toBeFalsy()
      expect(isRealArray(null)).toBeFalsy()
      expect(isRealArray(undefined)).toBeFalsy()
    })
  })

  describe('getBrackets', () => {
    it('should properly return bracket', () => {
      expect(getBrackets(ObjectTypes.Object, 'start')).toEqual('{')
      expect(getBrackets(ObjectTypes.Object, 'end')).toEqual('}')
      expect(getBrackets(ObjectTypes.Array, 'start')).toEqual('[')
      expect(getBrackets(ObjectTypes.Array, 'end')).toEqual(']')
    })
  })

  describe('isValidKey', () => {
    it('should properly validate key', () => {
      expect(isValidKey('"a"')).toBeTruthy()
      expect(isValidKey('"key_name"')).toBeTruthy()
      expect(isValidKey('"a\'"')).toBeTruthy()
      expect(isValidKey('"a')).toBeFalsy()
      expect(isValidKey('"')).toBeFalsy()
    })
  })
})
