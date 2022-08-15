import { RedisResponseBufferType } from 'uiSrc/slices/interfaces'
import {
  bufferToString,
  anyToBuffer,
  stringToBuffer,
  bufferToUTF8,
  bufferToASCII,
  UTF8ToBuffer,
  isEqualBuffers,
  hexToBuffer,
  bufferToHex,
  bufferToBinary,
  binaryToBuffer
} from 'uiSrc/utils'

const defaultValues = [
  { unicode: 'test', ascii: 'test', hex: '74657374', uint8Array: [116, 101, 115, 116], binary: '01110100011001010111001101110100' },
  { unicode: 'test test', ascii: 'test test', hex: '746573742074657374', uint8Array: [116, 101, 115, 116, 32, 116, 101, 115, 116], binary: '011101000110010101110011011101000010000001110100011001010111001101110100' },
  { unicode: '嘿', ascii: '\\xe5\\x98\\xbf', hex: 'e598bf', uint8Array: [229, 152, 191], binary: '111001011001100010111111' },
  { unicode: '\xea12 \x12 p5', ascii: '\\xc3\\xaa12 \\x12 p5', hex: 'c3aa31322012207035', uint8Array: [195, 170, 49, 50, 32, 18, 32, 112, 53], binary: '110000111010101000110001001100100010000000010010001000000111000000110101' },
  { unicode: 'hi \n hi \t', ascii: 'hi \\n hi \\t', hex: '6869200a2068692009', uint8Array: [104, 105, 32, 10, 32, 104, 105, 32, 9], binary: '011010000110100100100000000010100010000001101000011010010010000000001001' },
  { unicode: '!@#54ueo\'6&*(){', ascii: '!@#54ueo\'6&*(){', hex: '214023353475656f2736262a28297b', uint8Array: [33, 64, 35, 53, 52, 117, 101, 111, 39, 54, 38, 42, 40, 41, 123], binary: '001000010100000000100011001101010011010001110101011001010110111100100111001101100010011000101010001010000010100101111011' },
  { unicode: 'привет', ascii: '\\xd0\\xbf\\xd1\\x80\\xd0\\xb8\\xd0\\xb2\\xd0\\xb5\\xd1\\x82', hex: 'd0bfd180d0b8d0b2d0b5d182', uint8Array: [208, 191, 209, 128, 208, 184, 208, 178, 208, 181, 209, 130], binary: '110100001011111111010001100000001101000010111000110100001011001011010000101101011101000110000010' },
]

const getStringToBufferTests = defaultValues.map(({ unicode, uint8Array }) =>
  ({ input: unicode, expected: { data: uint8Array, type: RedisResponseBufferType.Buffer } }))

describe('stringToBuffer', () => {
  test.each(getStringToBufferTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = stringToBuffer(input)
    result.data = Array.from(result.data)
    expect(result).toEqual(expected)
  })
})

const getAnyToBufferTests = defaultValues.map(({ uint8Array }) =>
  ({ input: uint8Array, expected: { data: uint8Array, type: RedisResponseBufferType.Buffer } }))

describe('anyToBuffer', () => {
  test.each(getAnyToBufferTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = anyToBuffer(input)
    result.data = Array.from(result.data)
    expect(result).toEqual(expected)
  })
})

const getHexToBufferTests = defaultValues.map(({ hex, uint8Array }) =>
  ({ input: hex, expected: { data: uint8Array, type: RedisResponseBufferType.Buffer } }))

describe('hexToBuffer', () => {
  test.each(getHexToBufferTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = hexToBuffer(input)
    result.data = Array.from(result.data)
    expect(result).toEqual(expected)
  })
})

const getBufferToStringTests = defaultValues.map(({ unicode, uint8Array }) =>
  ({ input: anyToBuffer(uint8Array), expected: unicode }))

describe('bufferToString', () => {
  test.each(getBufferToStringTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    expect(bufferToString(input)).toEqual(expected)
  })
})

describe('bufferToUTF8', () => {
  test.each(getBufferToStringTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    expect(bufferToUTF8(input)).toEqual(expected)
  })
})

const getBufferToASCIITests = defaultValues.map(({ ascii, uint8Array }) =>
  ({ input: anyToBuffer(uint8Array), expected: ascii }))

describe('bufferToASCII', () => {
  test.each(getBufferToASCIITests)('%j', ({ input, expected }) => {
    // @ts-ignore
    expect(bufferToASCII(input)).toEqual(expected)
  })
})

const getBufferToHexTests = defaultValues.map(({ hex, uint8Array }) =>
  ({ input: anyToBuffer(uint8Array), expected: hex }))

describe('bufferToASCII', () => {
  test.each(getBufferToHexTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    expect(bufferToHex(input)).toEqual(expected)
  })
})

describe('UTF8ToBuffer', () => {
  test.each(getStringToBufferTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = UTF8ToBuffer(input)
    result.data = Array.from(result.data)
    expect(result).toEqual(expected)
  })
})

const getBuffersTest = [
  { input1: anyToBuffer([116, 101, 115, 116]), input2: anyToBuffer([116, 101, 115, 116]), expected: true },
  { input1: anyToBuffer([16, 101, 115, 116]), input2: anyToBuffer([116, 101, 116]), expected: false },
  { input1: anyToBuffer([16, 101, 5435, 116]), input2: anyToBuffer([116, 101, 543]), expected: false },
  { input1: { data: [16, 101, 35, 116] }, input2: anyToBuffer([16, 101, 35, 116]), expected: true },
  { input1: { data: [16, 101, 35, 116] }, input2: { data: [16, 101, 35, 116] }, expected: true },
]

describe('isEqualBuffers', () => {
  test.each(getBuffersTest)('%j', ({ input1, input2, expected }) => {
    // @ts-ignore
    expect(isEqualBuffers(input1, input2)).toEqual(expected)
  })
})

const getBufferToBinaryTests = defaultValues.map(({ binary, uint8Array }) =>
  ({ input: anyToBuffer(uint8Array), expected: binary }))

describe('bufferToBinary', () => {
  test.each(getBufferToBinaryTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    expect(bufferToBinary(input)).toEqual(expected)
  })
})

describe('binaryToBuffer', () => {
  test.each(getBufferToBinaryTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    expect(binaryToBuffer(expected)).toEqual(input)
  })
})
