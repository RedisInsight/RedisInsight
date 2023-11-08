import { EuiButton, EuiCheckbox, EuiFlexGroup, EuiFlexItem, EuiPopover, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { monaco } from 'react-monaco-editor'
import parse from 'html-react-parser'
import { useHistory, useParams } from 'react-router-dom'
import { getCommandsForExecution, truncateText } from 'uiSrc/utils'
import { BooleanParams, CodeButtonParams, MonacoLanguage, Pages } from 'uiSrc/constants'

import { CodeBlock } from 'uiSrc/components'
import { getDBConfigStorageField, setDBConfigStorageField } from 'uiSrc/services'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import styles from './styles.module.scss'

export interface Props {
  content: string
  onApply: (params?: CodeButtonParams, onFinish?: () => void) => void
  onCopy?: () => void
  label: string
  isLoading?: boolean
  className?: string
  params?: CodeButtonParams
}

const FINISHED_COMMAND_INDICATOR_TIME_MS = 3_000

const CodeButtonBlock = (props: Props) => {
  const {
    onApply,
    label,
    className,
    params,
    content,
    onCopy,
    ...rest
  } = props

  const [highlightedContent, setHighlightedContent] = useState('')
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [notShowAgain, setNotShowAgain] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRunned, setIsRunned] = useState(false)

  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()

  const isNotShowConfirmation = getDBConfigStorageField(
    instanceId,
    ConfigDBStorageItem.notShowConfirmationRunTutorial
  )
  const isButtonHasConfirmation = params?.run_confirmation === BooleanParams.true

  useEffect(() => {
    monaco.editor.colorize(content.trim(), MonacoLanguage.Redis, {})
      .then((data) => {
        setHighlightedContent(data)
      })
  }, [])

  const handleCopy = () => {
    const query = getCommandsForExecution(content)?.join('\n') || ''
    navigator?.clipboard?.writeText(query)
    onCopy?.()
  }

  const handleChangeDatabase = () => {
    history.push(Pages.home)
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_DATABASE_CHANGE_CLICKED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const runQuery = () => {
    setIsLoading(true)
    onApply(params, () => {
      setIsLoading(false)
      setIsRunned(true)
      setTimeout(() => setIsRunned(false), FINISHED_COMMAND_INDICATOR_TIME_MS)
    })
  }

  const handleRunClicked = () => {
    if (!isNotShowConfirmation && isButtonHasConfirmation) {
      setIsConfirmationOpen(true)
      return
    }
    runQuery()
  }

  const handleApplyRun = () => {
    if (notShowAgain) {
      setDBConfigStorageField(instanceId, ConfigDBStorageItem.notShowConfirmationRunTutorial, true)
    }
    setIsConfirmationOpen(false)
    runQuery()
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
          <EuiPopover
            ownFocus
            className={styles.popoverAnchor}
            panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
            anchorClassName={styles.popoverAnchor}
            anchorPosition="upLeft"
            isOpen={isConfirmationOpen}
            panelPaddingSize="m"
            closePopover={() => setIsConfirmationOpen(false)}
            focusTrapProps={{
              scrollLock: true
            }}
            button={(
              <EuiButton
                onClick={handleRunClicked}
                iconType={isRunned ? 'check' : 'play'}
                iconSide="right"
                color="success"
                size="s"
                disabled={isLoading || isRunned}
                isLoading={isLoading}
                className={cx(styles.actionBtn, styles.runBtn)}
                {...rest}
                data-testid={`run-btn-${label}`}
              >
                Run
              </EuiButton>
            )}
          >
            <EuiTitle size="xxs">
              <span>Run commands</span>
            </EuiTitle>
            <EuiSpacer size="s" />
            <EuiText size="s">
              This tutorial will change data in your database, are you sure you want to run commands in this database?
            </EuiText>
            <EuiSpacer size="s" />
            <EuiCheckbox
              id="showAgain"
              name="showAgain"
              label="Don't show again for this database"
              checked={notShowAgain}
              className={styles.showAgainCheckBox}
              onChange={(e) => setNotShowAgain(e.target.checked)}
              data-testid="checkbox-show-again"
              aria-label="checkbox do not show agan"
            />
            <div className={styles.popoverFooter}>
              <div>
                <EuiButton
                  color="secondary"
                  size="s"
                  className={styles.popoverBtn}
                  onClick={handleChangeDatabase}
                  data-testid="tutorial-popover-change-db"
                >
                  Change Database
                </EuiButton>
                <EuiButton
                  color="secondary"
                  fill
                  size="s"
                  className={styles.popoverBtn}
                  onClick={handleApplyRun}
                  data-testid="tutorial-popover-apply-run"
                >
                  Run
                </EuiButton>
              </div>
            </div>
          </EuiPopover>
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
