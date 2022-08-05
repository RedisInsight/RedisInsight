import React from 'react'
import { KeyValueFormat } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { bufferToUTF8 } from './bufferFormatters'

const bufferToUnicode = (reply: RedisResponseBuffer): string =>
  bufferToUTF8(reply)

const bufferToJSON = (reply: RedisResponseBuffer) => (
  <span style={{ color: 'red' }}>
    <span>
      {JSON.stringify(
        { test: 'test', uoeuoeuoeu: ['123', '123123', false, true, 323123123, 323123123, 323123123, 323123123] }, null,
        2
      )}
    </span>
  </span>
)

const formattingBuffer = (reply: RedisResponseBuffer, format: KeyValueFormat): string | JSX.Element => {
  let formatter = bufferToUnicode
  if (format === KeyValueFormat.JSON) {
    formatter = bufferToJSON
  }

  return formatter(reply)
}

export {
  formattingBuffer,
}
