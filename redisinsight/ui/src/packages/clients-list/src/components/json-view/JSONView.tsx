import React, { useEffect, useState } from 'react'
import JSONPretty from 'react-json-pretty'
import { formatRedisReply } from 'redisinsight-plugin-sdk'
import { isJson } from '../../utils'

interface Props {
  value: string
  command: string
}

enum HighlightPrimitiveCommands {
  JSON_GET = 'JSON.GET',
  JSON_MGET = 'JSON.MGET',
}

const JSONView = (props: Props) => {
  const { value, command = '' } = props

  const [formattedValue, setFormattedValue] = useState('')

  useEffect(() => {
    try {
      JSON.parse(value)
      const isHighlightPrimitive = Object.values(HighlightPrimitiveCommands)
        .some((cmd) => command?.toUpperCase().startsWith(cmd))

      if (!isJson(value) && !isHighlightPrimitive) {
        throw new Error('Not Object or Array type')
      }
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
          <JSONPretty json={value} space={4} />
        </div>
      )}
    </>
  )
}

export default JSONView
