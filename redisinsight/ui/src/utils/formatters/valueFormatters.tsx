import JSONViewer from 'uiSrc/components/json-viewer/JSONViewer'
import { KeyValueFormat } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { bufferToUTF8 } from 'uiSrc/utils'
import { reSerializeJSON } from 'uiSrc/utils/formatters/json'

interface FormattingProps {
  expanded: boolean
}

const isTextViewFormatter = (format: KeyValueFormat) => [KeyValueFormat.Unicode, KeyValueFormat.ASCII].includes(format)
const isJsonViewFormatter = (format: KeyValueFormat) => !isTextViewFormatter(format)

const bufferToUnicode = (reply: RedisResponseBuffer): string =>
  bufferToUTF8(reply)

const bufferToJSON = (reply: string, props: FormattingProps): { value: JSX.Element | string, isValid: boolean } =>
  JSONViewer({ value: reply, ...props })

const formattingBuffer = (
  reply: RedisResponseBuffer,
  format: KeyValueFormat,
  props?: FormattingProps
): { value: JSX.Element | string, isValid: boolean } => {
  switch (format) {
    case KeyValueFormat.JSON: {
      return bufferToJSON(bufferToUTF8(reply), props as FormattingProps)
    }
    case KeyValueFormat.Msgpack: {
      // TODO: for future
      return { value: bufferToUnicode(reply), isValid: true }
    }
    default: {
      return { value: bufferToUnicode(reply), isValid: true }
    }
  }
}

const getSerializedFormat = (format: KeyValueFormat, val: string, space?: number) => {
  switch (format) {
    case KeyValueFormat.JSON: {
      return reSerializeJSON(val, space)
    }
    default: {
      return val
    }
  }
}

export {
  formattingBuffer,
  isTextViewFormatter,
  isJsonViewFormatter,
  getSerializedFormat
}
