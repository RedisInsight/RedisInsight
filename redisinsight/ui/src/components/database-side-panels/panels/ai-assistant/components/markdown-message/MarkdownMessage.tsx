import React, { useEffect, useState } from 'react'
import JsxParser from 'react-jsx-parser'
import {
  CloudLink,
  Code,
} from 'uiSrc/components/database-side-panels/panels/enablement-area/EnablementArea/components'
import { ExternalLink } from 'uiSrc/components'
import MarkdownToJsxString
  from 'uiSrc/components/database-side-panels/panels/enablement-area/EnablementArea/utils/formatter/MarkdownToJsxString'

export interface Props {
  children: string
}

const RedisCodeBlock = (props: any) => (<Code {...props} params="[executable=false]" />)

const MarkdownMessage = (props: Props) => {
  const { children } = props
  const components: any = { Code: RedisCodeBlock, CloudLink, ExternalLink }
  const [content, setContent] = useState('')

  useEffect(() => {
    const formatContent = async () => {
      try {
        const formated = await (new MarkdownToJsxString()).format({ data: children })
        setContent(formated)
      } catch {
        // ignore
      }
    }

    formatContent()
  }, [children])

  return (
    // @ts-ignore
    <JsxParser
      bindings={{ }}
      components={components}
      blacklistedTags={['iframe', 'script']}
      autoCloseVoidElements
      jsx={content}
      onError={(e) => console.error(e)}
    />
  )
}

export default MarkdownMessage
