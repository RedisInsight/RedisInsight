import { Buffer } from 'buffer'
// eslint-disable-next-line import/order
import { RedisResponseBuffer, RedisString, UintArray } from 'uiSrc/slices/interfaces'

declare global {
  interface Window {
    ri: RedisInsight
    Buffer: typeof Buffer
  }

  interface RedisInsight {
    bufferToUTF8: (reply: RedisResponseBuffer) => string
    bufferToASCII: (reply: RedisResponseBuffer) => string
    UintArrayToString: (reply: UintArray) => string
    UTF8ToBuffer: (reply: string) => RedisResponseBuffer
    ASCIIToBuffer: (reply: string) => RedisResponseBuffer
    stringToBuffer: (reply: string) => RedisResponseBuffer
    bufferToString: (reply: RedisString) => string
  }
}
