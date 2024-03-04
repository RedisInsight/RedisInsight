import React, { useEffect, useState } from 'react'
import JsxParser from 'react-jsx-parser'
import { ExternalLink } from 'uiSrc/components'
import MarkdownToJsxString from 'uiSrc/services/formatter/MarkdownToJsxString'
import { CloudLink, CodeButtonBlock } from 'uiSrc/components/markdown'

export interface Props {
  children: string
  onMessageRendered?: () => void
}

export interface CodeProps {
  children: string
}

const RedisCodeBlock = ({ children }: CodeProps) => (
  <CodeButtonBlock
    content={children}
    isShowConfirmation={false}
    params={{ executable: 'false' }}
  />
)

const MarkdownMessage = (props: Props) => {
  const { children, onMessageRendered } = props
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

  useEffect(() => {
    if (content) {
      onMessageRendered?.()
    }
  }, [content])

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
