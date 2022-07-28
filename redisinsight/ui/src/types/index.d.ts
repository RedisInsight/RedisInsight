import { RedisResponseBuffer, UintArray } from 'uiSrc/slices/interfaces'

declare global {
  interface Window {
    bufferToUTF8: (reply: RedisResponseBuffer) => string
    bufferToASCII: (reply: RedisResponseBuffer) => string
    UintArrayToString: (reply: UintArray) => string
    UTF8ToBuffer: (reply: string) => RedisResponseBuffer
    ASCIIToBuffer: (reply: string) => RedisResponseBuffer
    ASCIIHTMLToBuffer: (reply: string) => RedisResponseBuffer
  }
}
