import React, { useEffect, useState } from 'react'
import JSONBigInt from 'json-bigint'
import { formatRedisReply } from 'redisinsight-plugin-sdk'
import JsonComponent from './components/json-component'

interface Props {
  value: string
  command: string
}

const JSONView = (props: Props) => {
  const { value, command = '' } = props

  const [formattedValue, setFormattedValue] = useState('')

  useEffect(() => {
    try {
      JSONBigInt({ useNativeBigInt: true }).parse(value)
    } catch (_err) {
      const formatResponse = async () => {
        const formattedResponse = await formatRedisReply(value, command)
        setFormattedValue(formattedResponse)
      }
      formatResponse()
    }
  }, [])

  return (
    <>
      {formattedValue && (
        <div className="cli-output-response-success">{formattedValue}</div>
      )}
      {!formattedValue && (
        <div className="jsonViewer" data-testid="json-view">
          <JsonComponent data={JSONBigInt({ useNativeBigInt: true }).parse(value)} space={2} />
        </div>
      )}
    </>
  )
}

export default JSONView
