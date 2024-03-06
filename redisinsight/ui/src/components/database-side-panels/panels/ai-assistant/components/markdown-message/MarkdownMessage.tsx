import React, { useCallback, useEffect, useState } from 'react'
import JsxParser from 'react-jsx-parser'
import { useDispatch } from 'react-redux'
import { CloudLink } from 'uiSrc/components/database-side-panels/panels/enablement-area/EnablementArea/components'
import { ExternalLink } from 'uiSrc/components'
import MarkdownToJsxString
  from 'uiSrc/components/database-side-panels/panels/enablement-area/EnablementArea/utils/formatter/MarkdownToJsxString'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { CodeButtonParams } from 'uiSrc/constants'
import { sendWbQueryAction } from 'uiSrc/slices/workbench/wb-results'
import CodeButtonBlock
  from 'uiSrc/components/database-side-panels/panels/enablement-area/EnablementArea/components/CodeButtonBlock'
import { Props as CodeProps } from 'uiSrc/components/database-side-panels/panels/enablement-area/EnablementArea/components/Code/Code'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

export interface Props {
  children: string
  onMessageRendered?: () => void
  type: AiChatType
  modules?: AdditionalRedisModule[]
}

const MarkdownMessage = (props: Props) => {
  const { children, onMessageRendered, type, modules } = props

  const dispatch = useDispatch()

  const CodeBlock = useCallback((props: CodeProps) => {
    const { children } = props
    const isQueryMessage = type === AiChatType.Query

    const handleApply = (params?: CodeButtonParams, onFinish?: () => void) => {
      dispatch(sendWbQueryAction(children, null, params, { afterAll: onFinish }, onFinish))
    }

    return (
      <CodeButtonBlock
        label=""
        content={children}
        isShowConfirmation
        onApply={handleApply}
        params={{ executable: isQueryMessage ? 'true' : 'false' }}
        modules={modules}
      />
    )
  }, [modules])

  const components: any = { Code: CodeBlock, CloudLink, ExternalLink }
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

export default React.memo(MarkdownMessage)
