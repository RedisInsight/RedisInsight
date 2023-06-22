import React, { useEffect, useState } from 'react'
import JSONPretty from 'react-json-pretty'
import { formatRedisReply } from 'redisinsight-plugin-sdk'

interface Props {
  value: string
  command: string
}

const JSONView = (props: Props) => {
  const { value, command = '' } = props

  const [formattedValue, setFormattedValue] = useState('')

  useEffect(() => {
    try {
      JSON.parse(value)
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
          <JSONPretty json={value} space={2} />
        </div>
      )}
    </>
  )
}

export default JSONView
