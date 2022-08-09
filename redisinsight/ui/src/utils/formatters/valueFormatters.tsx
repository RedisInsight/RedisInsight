import { decode, encode } from '@msgpack/msgpack'
import JSONViewer from 'uiSrc/components/json-viewer/JSONViewer'
import { KeyValueFormat } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { anyToBuffer, bufferToUTF8, stringToBuffer, UintArrayToString } from 'uiSrc/utils'
import { reSerializeJSON } from 'uiSrc/utils/formatters/json'

interface FormattingProps {
  expanded: boolean
}

const isTextViewFormatter = (format: KeyValueFormat) => [KeyValueFormat.Unicode, KeyValueFormat.ASCII].includes(format)
const isJsonViewFormatter = (format: KeyValueFormat) => !isTextViewFormatter(format)

const bufferToUnicode = (reply: RedisResponseBuffer): string =>
  bufferToUTF8(reply)

const bufferToJSON = (
  reply: RedisResponseBuffer,
  props: FormattingProps
): { value: JSX.Element | string, isValid: boolean } =>
  JSONViewer({ value: bufferToUTF8(reply), ...props })

const formattingBuffer = (
  reply: RedisResponseBuffer,
  format: KeyValueFormat,
  props?: FormattingProps
): { value: JSX.Element | string, isValid: boolean } => {
  switch (format) {
    case KeyValueFormat.JSON: {
      return bufferToJSON(reply, props as FormattingProps)
    }
    case KeyValueFormat.Msgpack: {
      try {
        const decoded = decode(reply.data)
        const value = JSON.stringify(decoded)
        return JSONViewer({ value, ...props })
      } catch (e) {
        return { value: bufferToUTF8(reply), isValid: false }
      }
    }
    default: {
      return { value: bufferToUnicode(reply), isValid: true }
    }
  }
}

const bufferToSerializedFormat = (format: KeyValueFormat, value: RedisResponseBuffer, space?: number): string => {
  switch (format) {
    case KeyValueFormat.JSON: {
      return reSerializeJSON(bufferToUTF8(value), space)
    }
    case KeyValueFormat.Msgpack: {
      try {
        const decoded = decode(value.data)
        const stringified = JSON.stringify(decoded)
        return reSerializeJSON(stringified, space)
      } catch (e) {
        return bufferToUTF8(value)
      }
    }
    default: {
      return bufferToUTF8(value)
    }
  }
}

const stringToSerializedBufferFormat = (format: KeyValueFormat, value: string): RedisResponseBuffer => {
  switch (format) {
    case KeyValueFormat.JSON: {
      return stringToBuffer(reSerializeJSON(value))
    }
    case KeyValueFormat.Msgpack: {
      try {
        const json = JSON.parse(value)
        const encoded = encode(json)
        return anyToBuffer(encoded)
      } catch (e) {
        return stringToBuffer(value)
      }
    }
    default: {
      return stringToBuffer(value)
    }
  }
}

export {
  formattingBuffer,
  isTextViewFormatter,
  isJsonViewFormatter,
  bufferToSerializedFormat,
  stringToSerializedBufferFormat
}
