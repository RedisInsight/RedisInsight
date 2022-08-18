import { isString } from 'lodash'
import { KeyValueFormat } from 'uiSrc/constants'
import { Buffer } from 'buffer'
// eslint-disable-next-line import/order
import {
  RedisResponseBuffer,
  RedisResponseBufferType,
  RedisString,
  UintArray,
} from 'uiSrc/slices/interfaces'
import { Nullable } from '../types'

const decoder = new TextDecoder('utf-8')
const encoder = new TextEncoder()

const isEqualBuffers = (a?: Nullable<RedisResponseBuffer>, b?: Nullable<RedisResponseBuffer>) =>
  a?.data?.join(',') === b?.data?.join(',')

// eslint-disable-next-line no-control-regex
const IS_NON_PRINTABLE_ASCII_CHARACTER = /[^ -~\u0007\b\t\n\r]/

const decimalToHexString = (d: number, padding = 2) => {
  const hex = Number(d).toString(16)
  return '0'.repeat(padding).substring(0, padding - hex.length) + hex
}

const bufferToHex = (reply: RedisResponseBuffer): string => {
  let result = ''

  reply.data.forEach((byte: number) => {
    // eslint-disable-next-line
    result += ('0' + (byte & 0xFF).toString(16)).slice(-2)
  })

  return result
}

const bufferToBinary = (reply: RedisResponseBuffer): string =>
  Array.from(reply.data).reduce((str, byte) => str + byte.toString(2).padStart(8, '0'), '')

const binaryToBuffer = (reply: string) => {
  const data: number[] = reply.match(/.{1,8}/g)?.map((v) => parseInt(v, 2)) || []
  return anyToBuffer(data)
}

const bufferToASCII = (reply: RedisResponseBuffer): string => {
  let result = ''
  reply.data.forEach((byte: number) => {
    const char = decoder.decode(new Uint8Array([byte]))
    if (IS_NON_PRINTABLE_ASCII_CHARACTER.test(char)) {
      result += `\\x${decimalToHexString(byte)}`
    } else {
      switch (char) {
        case '\u0007': // Bell character
          result += '\\a'
          break
        case '\\':
          result += '\\\\'
          break
        case '"':
          result += '\\"'
          break
        case '\b':
          result += '\\b'
          break
        case '\t':
          result += '\\t'
          break
        case '\n':
          result += '\\n'
          break
        case '\r':
          result += '\\r'
          break
        default:
          result += char
      }
    }
  })
  return result
}

const anyToBuffer = (reply: UintArray): RedisResponseBuffer =>
  ({ data: reply, type: RedisResponseBufferType.Buffer })

const ASCIIToBuffer = (str: string) => {
  let result = ''

  for (let i = 0; i < str.length;) {
    if (str.substring(i, i + 2) === '\\x') {
      result += str.substring(i + 2, i + 4)
      i += 4
    } else {
      result += Buffer.from(str[i++]).toString('hex')
    }
  }

  return anyToBuffer(Array.from(Buffer.from(result, 'hex')))
}

const bufferToUTF8 = (reply: RedisResponseBuffer): string => decoder.decode(new Uint8Array(reply.data))

const UintArrayToString = (reply: UintArray): string => decoder.decode(new Uint8Array(reply))

const UTF8ToBuffer = (reply: string): RedisResponseBuffer => anyToBuffer(encoder.encode(reply))

// common formatters
const stringToBuffer = (data: string, formatResult: KeyValueFormat = KeyValueFormat.Unicode): RedisResponseBuffer => {
  switch (formatResult) {
    case KeyValueFormat.Unicode: {
      return UTF8ToBuffer(data)
    }
    case KeyValueFormat.ASCII: {
      return ASCIIToBuffer(data)
    }
    default: {
      return UTF8ToBuffer(data)
    }
  }
}

const hexToBuffer = (data: string): RedisResponseBuffer => {
  let string = data
  const result = []
  while (string.length >= 2) {
    result.push(parseInt(string.substring(0, 2), 16))
    string = string.substring(2, string.length)
  }
  return { type: RedisResponseBufferType.Buffer, data: result }
}

const bufferToString = (data: RedisString = '', formatResult: KeyValueFormat = KeyValueFormat.Unicode): string => {
  if (!isString(data) && data?.type === RedisResponseBufferType.Buffer) {
    switch (formatResult) {
      case KeyValueFormat.Unicode: {
        return bufferToUTF8(data)
      }
      case KeyValueFormat.ASCII: {
        return bufferToASCII(data)
      }

      default: {
        return bufferToUTF8(data)
      }
    }
  }
  return data?.toString()
}

export default bufferToString

export {
  bufferToUTF8,
  bufferToASCII,
  bufferToHex,
  UTF8ToBuffer,
  decimalToHexString,
  ASCIIToBuffer,
  isEqualBuffers,
  stringToBuffer,
  bufferToString,
  UintArrayToString,
  hexToBuffer,
  anyToBuffer,
  bufferToBinary,
  binaryToBuffer
}

window.ri = {
  bufferToUTF8,
  bufferToASCII,
  UTF8ToBuffer,
  ASCIIToBuffer,
  UintArrayToString,
  stringToBuffer,
  bufferToString,
}

// for BE libraries which work with Buffer
window.Buffer = Buffer
