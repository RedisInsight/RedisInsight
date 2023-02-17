import * as fflate from 'fflate'
import * as fzstd from 'fzstd'
import { forIn } from 'lodash'
import { COMPRESSOR_MAGIC_SYMBOLS, ICompressorMagicSymbols, KeyValueCompressor } from 'uiSrc/constants'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'
import { anyToBuffer, Nullable } from 'uiSrc/utils'

const decompressingBuffer = (
  reply: RedisResponseBuffer,
): { value: RedisString, compressor: Nullable<KeyValueCompressor> } => {
  const compressor = getCompressor(reply)

  try {
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
      if (replyStart.startsWith(magicSymbols) && replyStart.length > magicSymbols.length) {
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
