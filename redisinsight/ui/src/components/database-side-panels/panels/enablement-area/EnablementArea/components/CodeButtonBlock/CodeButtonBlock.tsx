import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from '@elastic/eui'
import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { monaco } from 'react-monaco-editor'
import parse from 'html-react-parser'
import { truncateText } from 'uiSrc/utils'
import { CodeButtonParams, ExecuteButtonMode, MonacoLanguage } from 'uiSrc/constants'

import { CodeBlock } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  content: string
  onClick: (execute: { mode?: ExecuteButtonMode, params?: CodeButtonParams }) => void
  onCopy?: () => void
  label: string
  isLoading?: boolean
  disabled?: boolean
  className?: string
  params?: CodeButtonParams
  mode?: ExecuteButtonMode
}

const CodeButtonBlock = (props: Props) => {
  const { onClick, label, isLoading, className, disabled, params, mode, content, onCopy, ...rest } = props
  const [highlightedContent, setHighlightedContent] = useState('')

  useEffect(() => {
    monaco.editor.colorize(content.trim(), MonacoLanguage.Redis, {})
      .then((data) => {
        setHighlightedContent(data)
      })
  }, [])

  const handleCopy = () => {
    navigator?.clipboard?.writeText(content)
    onCopy?.()
  }

  return (
    <div className={styles.wrapper}>
      <EuiFlexGroup gutterSize="none">
        <EuiFlexItem>
          <EuiTitle size="xxxs" className={styles.label} data-testid="code-button-block-label">
            <span>{truncateText(label, 86)}</span>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false} className={styles.actions}>
          <EuiButton
            onClick={handleCopy}
            iconType="copy"
            size="s"
            className={cx(styles.actionBtn, styles.copyBtn)}
            data-testid={`copy-btn-${label}`}
          >
            Copy
          </EuiButton>
          <EuiButton
            onClick={() => onClick({ mode, params })}
            iconType="play"
            iconSide="right"
            color="success"
            size="s"
            className={cx(styles.actionBtn, styles.runBtn)}
            {...rest}
            data-testid={`run-btn-${label}`}
          >
            Run
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <div className={styles.content} data-testid="code-button-block-content">
        <CodeBlock className={styles.code}>
          {highlightedContent ? parse(highlightedContent) : content}
        </CodeBlock>
      </div>
      <EuiSpacer size="s" />
    </div>
  )
}

export default CodeButtonBlock
