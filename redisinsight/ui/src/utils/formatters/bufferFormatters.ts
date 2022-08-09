import { isString } from 'lodash'
import {
  RedisResponseBuffer,
  RedisResponseBufferType,
  RedisResponseEncoding,
  RedisString,
  UintArray,
} from 'uiSrc/slices/interfaces'
import { Nullable } from '../types'

const decoder = new TextDecoder('utf-8')
const encoder = new TextEncoder()

const isEqualBuffers = (a?: Nullable<RedisResponseBuffer>, b?: Nullable<RedisResponseBuffer>) =>
  a?.data?.join() === b?.data?.join()

// eslint-disable-next-line no-control-regex
const IS_NON_PRINTABLE_ASCII_CHARACTER = /[^ -~\u0007\b\t\n\r]/

const decimalToHexString = (d: number, padding = 2) => {
  const hex = Number(d).toString(16)
  return '0'.repeat(padding).substr(0, padding - hex.length) + hex
}

const bufferToHex = (reply: RedisResponseBuffer): string => {
  let result = ''

  reply.data.forEach((byte: number) => {
    result += byte.toString(16)
  })

  // return result.replace(/\s/g, '').replace(/(.{2})/g, '$1 ')
  return result
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

const ASCIIHTMLToBuffer = (str: string): RedisResponseBuffer => {
  const asciiStr = str.replaceAll('\\\\', '\\')
  return ASCIIToBuffer(asciiStr)
}

const ASCIIToBuffer = (str:string): RedisResponseBuffer => {
  const chars = []
  for (let i = 0; i < str.length; ++i) {
    chars.push(str.charCodeAt(i))
  }
  return anyToBuffer(new Uint8Array(chars))
}

const bufferToUTF8 = (reply: RedisResponseBuffer): string => decoder.decode(new Uint8Array(reply.data))

const UintArrayToString = (reply: UintArray): string => decoder.decode(new Uint8Array(reply))

const UTF8ToBuffer = (reply: string): RedisResponseBuffer => anyToBuffer(encoder.encode(reply))

// common formatters
const stringToBuffer = (data: string): RedisResponseBuffer => UTF8ToBuffer(data)

const hexToBuffer = (data: string): RedisResponseBuffer => {
  // let stringWithoutSpaces = data.replace(/ /g, '')
  let string = data
  const result = []
  while (string.length >= 2) {
    result.push(parseInt(string.substring(0, 2), 16))
    string = string.substring(2, string.length)
  }
  return { type: RedisResponseBufferType.Buffer, data: result }
}

const bufferToString = (data: RedisString = '', formatResult: RedisResponseEncoding = RedisResponseEncoding.UTF8): string => {
  let string = data

  if (!isString(data) && data?.type === RedisResponseBufferType.Buffer) {
    string = formatResult === RedisResponseEncoding.UTF8 ? bufferToUTF8(data) : bufferToASCII(data)
  } else {
    string = string?.toString()
  }

  return string
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
}

window.ri = {
  bufferToUTF8,
  bufferToASCII,
  UTF8ToBuffer,
  ASCIIToBuffer,
  ASCIIHTMLToBuffer,
  UintArrayToString,
  stringToBuffer,
  bufferToString,
}
