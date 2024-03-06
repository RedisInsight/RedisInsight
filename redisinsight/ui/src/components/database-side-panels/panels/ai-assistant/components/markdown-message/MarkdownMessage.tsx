import React, { useCallback, useEffect, useState } from 'react'
import JsxParser from 'react-jsx-parser'
import { useDispatch } from 'react-redux'
import { ExternalLink } from 'uiSrc/components'
import MarkdownToJsxString from 'uiSrc/services/formatter/MarkdownToJsxString'
import { CloudLink, CodeButtonBlock } from 'uiSrc/components/markdown'
import { CodeButtonParams } from 'uiSrc/constants'
import { sendWbQueryAction } from 'uiSrc/slices/workbench/wb-results'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

export interface CodeProps {
  children: string
}

export interface Props {
  isExecutable?: boolean
  modules?: AdditionalRedisModule[]
  children: string
  onMessageRendered?: () => void
}

const MarkdownMessage = (props: Props) => {
  const { isExecutable = false, modules, children, onMessageRendered } = props

  const [content, setContent] = useState('')

  const dispatch = useDispatch()

  const CodeBlock = useCallback((props: CodeProps) => {
    const { children } = props

    const handleApply = (params?: CodeButtonParams, onFinish?: () => void) => {
      dispatch(sendWbQueryAction(children, null, params, { afterAll: onFinish }, onFinish))
    }

    return (
      <CodeButtonBlock
        label=""
        content={children}
        isShowConfirmation
        onApply={handleApply}
        params={{ executable: isExecutable ? 'true' : 'false' }}
        modules={modules}
      />
    )
  }, [modules])

  const components: any = { Code: CodeBlock, CloudLink, ExternalLink }

  useEffect(() => {
    const formatContent = async () => {
      try {
        const formated = await (new MarkdownToJsxString()).format({ data: children })
        console.log('foramtted', formated)
        setContent(formated)
      } catch (e) {
        console.log(e)
        console.log('error')
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

export default React.memo(MarkdownMessage)
