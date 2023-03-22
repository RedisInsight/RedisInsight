import { forIn, isUndefined } from 'lodash'
import { unzip } from 'gzip-js'
import { decompress as decompressFzstd } from 'fzstd'
import { decompress as decompressLz4 } from 'lz4js'
import { decompress as decompressSnappy } from '@stablelib/snappy'
import { COMPRESSOR_MAGIC_SYMBOLS, ICompressorMagicSymbols, KeyValueCompressor } from 'uiSrc/constants'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'
import { anyToBuffer, Nullable } from 'uiSrc/utils'

const decompressingBuffer = (
  reply: RedisResponseBuffer,
  compressorInit: Nullable<KeyValueCompressor> = null,
): { value: RedisString, compressor: Nullable<KeyValueCompressor>, isCompressed: boolean } => {
  const compressorByValue: Nullable<KeyValueCompressor> = getCompressor(reply)
  const compressor = compressorInit === compressorByValue
    || (!compressorByValue && compressorInit === KeyValueCompressor.SNAPPY)
    ? compressorInit
    : null

  try {
    switch (compressor) {
      case KeyValueCompressor.GZIP: {
        const value = unzip(Buffer.from(reply))

        return {
          compressor,
          isCompressed: !!compressorByValue,
          value: anyToBuffer(value),
        }
      }
      case KeyValueCompressor.ZSTD: {
        const value = decompressFzstd(Buffer.from(reply))

        return {
          compressor,
          isCompressed: !!compressorByValue,
          value: anyToBuffer(value),
        }
      }
      case KeyValueCompressor.LZ4: {
        const value = decompressLz4(Buffer.from(reply))
        return {
          compressor,
          isCompressed: !!compressorByValue,
          value: anyToBuffer(value),
        }
      }
      case KeyValueCompressor.SNAPPY: {
        const value = decompressSnappy(Buffer.from(reply))
        return {
          compressor,
          isCompressed: !!compressorByValue,
          value: anyToBuffer(value),
        }
      }
      default: {
        return { value: reply, compressor: null, isCompressed: !!compressorByValue }
      }
    }
  } catch (error) {
    return { value: reply, compressor, isCompressed: false }
  }
}

const getCompressor = (reply: RedisResponseBuffer): Nullable<KeyValueCompressor> => {
  const replyStart = reply?.data?.slice?.(0, 10)?.join?.(',') ?? ''
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
