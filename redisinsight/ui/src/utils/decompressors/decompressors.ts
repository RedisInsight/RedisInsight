import * as fflate from 'fflate'
import { COMPRESSOR_MAGIC_SYMBOLS, KeyValueCompressor } from 'uiSrc/constants'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'
import { anyToBuffer } from '../formatters'
import { Nullable } from '../types'

const decompressingBuffer = (
  reply: RedisResponseBuffer,
): { value: RedisString, compressor: Nullable<KeyValueCompressor> } => {
  const compressor = getCompressor(reply)

  switch (compressor) {
    case KeyValueCompressor.GZIP: {
      const value = fflate.gunzipSync(Buffer.from(reply))

      return {
        value: anyToBuffer(Array.from((value))),
        compressor: KeyValueCompressor.GZIP,
      }
    }
    case KeyValueCompressor.PHPGZCompress: {
      return { value: reply, compressor: KeyValueCompressor.PHPGZCompress }
    }
    default: {
      return { value: reply, compressor: null }
    }
  }
}

const getCompressor = (reply: RedisResponseBuffer): Nullable<KeyValueCompressor> => {
  const firstThree = reply.data?.slice?.(0, 3) ?? []

  // GZIP
  const gzipSymbols = COMPRESSOR_MAGIC_SYMBOLS[KeyValueCompressor.GZIP]
  const isGZIP = firstThree?.[0] === gzipSymbols?.[0] && firstThree?.[1] === gzipSymbols?.[1]

  if (isGZIP) {
    return KeyValueCompressor.GZIP
  }

  return null
}

export {
  getCompressor,
  decompressingBuffer,
}
