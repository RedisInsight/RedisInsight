import { Buffer } from 'buffer'
// eslint-disable-next-line import/order
import { Nullable, EnvVars } from 'uiSrc/utils'
import { KeyValueCompressor } from 'uiSrc/constants'
import { RedisResponseBuffer, RedisString, UintArray } from 'uiSrc/slices/interfaces'

declare global {
  interface Window {
    ri: RedisInsight
    Buffer: typeof Buffer
    ENV_VARS: EnvVars
  }

  interface RedisInsight {
    bufferToUTF8: (reply: RedisResponseBuffer) => string
    bufferToASCII: (reply: RedisResponseBuffer) => string
    UintArrayToString: (reply: UintArray) => string
    UTF8ToBuffer: (reply: string) => RedisResponseBuffer
    ASCIIToBuffer: (reply: string) => RedisResponseBuffer
    stringToBuffer: (reply: string) => RedisResponseBuffer
    anyToBuffer: (reply: UintArray) => RedisResponseBuffer
    bufferToString: (reply: RedisString) => string
    hexToBuffer: (reply: string) => RedisResponseBuffer,
    bufferToHex: (reply: RedisResponseBuffer) => string,
    bufferToBinary: (reply: RedisResponseBuffer) => string,
    binaryToBuffer: (reply: string) => RedisResponseBuffer
    getCompressor: (reply: RedisResponseBuffer) => Nullable<KeyValueCompressor>
  }
}
