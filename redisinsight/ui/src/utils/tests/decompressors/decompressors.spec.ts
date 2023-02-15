import { KeyValueCompressor } from 'uiSrc/constants'
import { decompressingBuffer, getCompressor } from 'uiSrc/utils/decompressors'
import { anyToBuffer, stringToBuffer } from 'uiSrc/utils/formatters'

export const GZIP_COMPRESSED_VALUE_1 = [
  31, 139, 8, 0, 223, 246, 236, 99, 0, 3, 1, 1, 0, 254, 255, 49, 183, 239, 220, 131, 1, 0, 0, 0
]
export const GZIP_COMPRESSED_VALUE_2 = [
  31, 139, 8, 0, 180, 246, 236, 99, 0, 3, 1, 1, 0, 254, 255, 50, 13, 190, 213, 26, 1, 0, 0, 0
]
export const GZIP_DECOMPRESSED_VALUE_1 = '1'
export const GZIP_DECOMPRESSED_VALUE_2 = '2'

const defaultValues = [
  { input: [49], compressor: null, output: '1' },
  { input: [49, 50], compressor: null, output: '12' },
  {
    input: GZIP_COMPRESSED_VALUE_1,
    compressor: KeyValueCompressor.GZIP,
    output: GZIP_DECOMPRESSED_VALUE_1,
  },
  {
    input: GZIP_COMPRESSED_VALUE_2,
    compressor: KeyValueCompressor.GZIP,
    output: GZIP_DECOMPRESSED_VALUE_2,
  },
].map((value) => ({
  ...value,
  input: anyToBuffer(value.input)
}))

describe('getCompressor', () => {
  test.each(defaultValues)('%j', ({ input, compressor: expected }) => {
    const result = getCompressor(input)
    expect(result).toEqual(expected)
  })
})

describe('decompressingBuffer', () => {
  test.each(defaultValues)('%j', ({ input, compressor, output }) => {
    const result = decompressingBuffer(input)

    const expectedValue = stringToBuffer(output)
    expectedValue.data = Array.from(expectedValue.data)

    expect(result).toEqual({ value: expectedValue, compressor })
  })
})
