import * as fflate from 'fflate'
import * as fzstd from 'fzstd'
import * as lz4js from 'lz4js'
import { forIn } from 'lodash'
import * as snappy from '@stablelib/snappy'
import { COMPRESSOR_MAGIC_SYMBOLS, ICompressorMagicSymbols, KeyValueCompressor } from 'uiSrc/constants'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'
import { anyToBuffer, Nullable } from 'uiSrc/utils'

const decompressingBuffer = (
  reply: RedisResponseBuffer,
  compressorInit: Nullable<KeyValueCompressor> = null,
): { value: RedisString, compressor: Nullable<KeyValueCompressor> } => {
  const compressor = compressorInit || getCompressor(reply)

  try {
    switch (compressor) {
      case KeyValueCompressor.GZIP: {
        const value = fflate.gunzipSync(Buffer.from(reply))

        return {
          compressor,
          value: anyToBuffer(value),
        }
      }
      case KeyValueCompressor.ZSTD: {
        const value = fzstd.decompress(Buffer.from(reply))

        return {
          compressor,
          value: anyToBuffer(value),
        }
      }
      case KeyValueCompressor.LZ4: {
        const value = lz4js.decompress(Buffer.from(reply))
        return {
          compressor,
          value: anyToBuffer(value),
        }
      }
      case KeyValueCompressor.SNAPPY: {
        const value = snappy.decompress(Buffer.from(reply))
        return {
          compressor,
          value: anyToBuffer(value),
        }
      }
      default: {
        return { value: reply, compressor: null }
      }
    }
  } catch (error) {
    console.warn(`Error during decompressing data, compressor: ${compressor}`)
    return { value: reply, compressor }
  }
}

const getCompressor = (reply: RedisResponseBuffer): Nullable<KeyValueCompressor> => {
  const replyStart = reply.data?.slice?.(0, 10)?.join?.(',') ?? ''
  let compressor: Nullable<KeyValueCompressor> = null

  forIn<ICompressorMagicSymbols>(
    COMPRESSOR_MAGIC_SYMBOLS,
    (magicSymbols: string, compressorName: string) => {
      if (
        replyStart.startsWith(magicSymbols)
        && replyStart.length > magicSymbols.length
        // no magic symbols for SNAPPY
        && compressorName !== KeyValueCompressor.SNAPPY
      ) {
        compressor = compressorName as KeyValueCompressor
        return false // break loop
      }

      return true
    }
  )

  return compressor
}

export {
  getCompressor,
  decompressingBuffer,
}

window.ri = {
  ...window.ri,
  getCompressor,
}
