import * as fflate from 'fflate'
import * as fzstd from 'fzstd'
import { isEqual } from 'lodash'
import { COMPRESSOR_MAGIC_SYMBOLS, KeyValueCompressor } from 'uiSrc/constants'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'
import { anyToBuffer, Nullable } from 'uiSrc/utils'

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
    case KeyValueCompressor.ZSTD: {
      const value = fzstd.decompress(Buffer.from(reply))

      return {
        compressor: KeyValueCompressor.ZSTD,
        value: anyToBuffer(value),
      }
    }
    default: {
      return { value: reply, compressor: null }
    }
  }
}

const getCompressor = (reply: RedisResponseBuffer): Nullable<KeyValueCompressor> => {
  const replyStart = reply.data?.slice?.(0, 10).join(',') ?? ''

  // GZIP
  const gzipSymbols = COMPRESSOR_MAGIC_SYMBOLS[KeyValueCompressor.GZIP]
  const isGZIP = replyStart.startsWith(gzipSymbols)

  if (isGZIP) {
    return KeyValueCompressor.GZIP
  }

  // ZSTD
  const zstdSymbols = COMPRESSOR_MAGIC_SYMBOLS[KeyValueCompressor.ZSTD]
  const isZSTD = replyStart.startsWith(zstdSymbols)

  if (isZSTD) {
    return KeyValueCompressor.ZSTD
  }

  return null
}

export {
  getCompressor,
  decompressingBuffer,
}
