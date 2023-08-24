import { encode } from 'msgpackr'
import { serialize } from 'php-serialize'
import { KeyValueFormat } from 'uiSrc/constants'
import { anyToBuffer, bufferToSerializedFormat, stringToBuffer, stringToSerializedBufferFormat } from 'uiSrc/utils'

describe('bufferToSerializedFormat', () => {
  describe(KeyValueFormat.JSON, () => {
    describe('should properly serialize', () => {
      const testValues = [{}, '""', 1, true, { a: { b: [1, 2, '3'] } }].map((v) => JSON.stringify(v))

      test.each(testValues)('test %j', (val) => {
        expect(bufferToSerializedFormat(KeyValueFormat.JSON, stringToBuffer(val))).toEqual(val)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(bufferToSerializedFormat(KeyValueFormat.JSON, stringToBuffer(val))).toEqual(val)
      })
    })
  })

  describe(KeyValueFormat.Msgpack, () => {
    describe('should properly serialize', () => {
      const testValues = [{}, '""', 6677, true, { a: { b: [1, 2, '3'] } }].map((v) => ({
        input: anyToBuffer(encode(v)),
        expected: JSON.stringify(v)
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(bufferToSerializedFormat(KeyValueFormat.Msgpack, input)).toEqual(expected)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(bufferToSerializedFormat(KeyValueFormat.Msgpack, stringToBuffer(val))).toEqual(val)
      })
    })
  })

  describe(KeyValueFormat.PHP, () => {
    describe('should properly serialize', () => {
      const testValues = [[1], '""', 6677, true, { a: { b: [1, 2, '3'] } }].map((v) => ({
        input: stringToBuffer(serialize(v)),
        expected: JSON.stringify(v)
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(bufferToSerializedFormat(KeyValueFormat.PHP, input)).toEqual(expected)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(bufferToSerializedFormat(KeyValueFormat.PHP, stringToBuffer(val))).toEqual(val)
      })
    })
  })
})

describe('stringToSerializedBufferFormat', () => {
  describe(KeyValueFormat.JSON, () => {
    describe('should properly unserialize', () => {
      const testValues = [{}, '""', 1, true, { a: { b: [1, 2, '3'] } }].map((v) => JSON.stringify(v))

      test.each(testValues)('test %j', (val) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.JSON, val)).toEqual(stringToBuffer(val))
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.JSON, val)).toEqual(stringToBuffer(val))
      })
    })
  })

  describe(KeyValueFormat.Msgpack, () => {
    describe('should properly unserialize', () => {
      const testValues = [{}, '""', 6677, true, { a: { b: [1, 2, '3'] } }].map((v) => ({
        input: JSON.stringify(v),
        expected: anyToBuffer(encode(v))
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.Msgpack, input)).toEqual(expected)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.Msgpack, val)).toEqual(stringToBuffer(val))
      })
    })
  })

  describe(KeyValueFormat.PHP, () => {
    describe('should properly unserialize', () => {
      const testValues = [[1], '""', 6677, true, { a: { b: [1, 2, '3'] } }].map((v) => ({
        input: JSON.stringify(v),
        expected: stringToBuffer(serialize(v))
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.PHP, input)).toEqual(expected)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.PHP, val)).toEqual(stringToBuffer(val))
      })
    })
  })
})
