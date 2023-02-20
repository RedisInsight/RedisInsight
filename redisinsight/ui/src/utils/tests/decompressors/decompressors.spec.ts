import { toNumber } from 'lodash'
import { COMPRESSOR_MAGIC_SYMBOLS, KeyValueCompressor } from 'uiSrc/constants'
import { UintArray } from 'uiSrc/slices/interfaces'
import { decompressingBuffer, getCompressor } from 'uiSrc/utils/decompressors'
import { anyToBuffer } from 'uiSrc/utils/formatters'
import {
  GZIP_COMPRESSED_VALUE_1,
  GZIP_COMPRESSED_VALUE_2,
  DECOMPRESSED_VALUE_1,
  DECOMPRESSED_VALUE_2,
  DECOMPRESSED_VALUE_STR_1,
  DECOMPRESSED_VALUE_STR_2,
  ZSTD_COMPRESSED_VALUE_1,
  ZSTD_COMPRESSED_VALUE_2,
  LZ4_COMPRESSED_VALUE_1,
  LZ4_COMPRESSED_VALUE_2,
} from './constants'

const defaultValues = [
  { input: [49], compressor: null, output: [49], outputStr: '1' },
  { input: [49, 50], compressor: null, output: [49, 50], outputStr: '12' },
  {
    input: COMPRESSOR_MAGIC_SYMBOLS[KeyValueCompressor.GZIP].split(',').map((symbol) => toNumber(symbol)),
    compressor: null,
    output: [31, 139],
    outputStr: '\\x1f\\x8b',
  },
  {
    input: COMPRESSOR_MAGIC_SYMBOLS[KeyValueCompressor.ZSTD].split(',').map((symbol) => toNumber(symbol)),
    compressor: null,
    output: [40, 181, 47, 253],
    outputStr: '(\\xb5/\\xfd',
  },
  {
    input: GZIP_COMPRESSED_VALUE_1,
    compressor: KeyValueCompressor.GZIP,
    output: DECOMPRESSED_VALUE_1,
    outputStr: DECOMPRESSED_VALUE_STR_1,
  },
  {
    input: GZIP_COMPRESSED_VALUE_2,
    compressor: KeyValueCompressor.GZIP,
    output: DECOMPRESSED_VALUE_2,
    outputStr: DECOMPRESSED_VALUE_STR_2,
  },
  {
    input: ZSTD_COMPRESSED_VALUE_1,
    compressor: KeyValueCompressor.ZSTD,
    output: DECOMPRESSED_VALUE_1,
    outputStr: DECOMPRESSED_VALUE_STR_1,
  },
  {
    input: ZSTD_COMPRESSED_VALUE_2,
    compressor: KeyValueCompressor.ZSTD,
    output: DECOMPRESSED_VALUE_2,
    outputStr: DECOMPRESSED_VALUE_STR_2,
  },
  {
    input: LZ4_COMPRESSED_VALUE_1,
    compressor: KeyValueCompressor.LZ4,
    output: DECOMPRESSED_VALUE_1,
    outputStr: DECOMPRESSED_VALUE_STR_1,
  },
  {
    input: LZ4_COMPRESSED_VALUE_2,
    compressor: KeyValueCompressor.LZ4,
    output: DECOMPRESSED_VALUE_2,
    outputStr: DECOMPRESSED_VALUE_STR_2,
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
    let value: UintArray = output

    if (compressor) {
      value = new Uint8Array(output)
    }

    expect(result).toEqual({ value: anyToBuffer(value), compressor })
  })
})
