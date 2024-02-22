import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPopover, EuiSpacer, EuiTitle, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { monaco } from 'react-monaco-editor'
import parse from 'html-react-parser'
import { useParams } from 'react-router-dom'
import { getCommandsForExecution, getUnsupportedModulesFromQuery, truncateText } from 'uiSrc/utils'
import { BooleanParams, CodeButtonParams, MonacoLanguage } from 'uiSrc/constants'

import { CodeBlock } from 'uiSrc/components'
import { getDBConfigStorageField } from 'uiSrc/services'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import { ModuleNotLoadedMinimalized, DatabaseNotOpened } from 'uiSrc/components/messages'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import {
  RunConfirmationPopover
} from './components'
import styles from './styles.module.scss'

export interface Props {
  content: string
  onApply: (params?: CodeButtonParams, onFinish?: () => void) => void
  modules?: AdditionalRedisModule[]
  onCopy?: () => void
  label: string
  isLoading?: boolean
  className?: string
  params?: CodeButtonParams
  isShowConfirmation?: boolean
}

const FINISHED_COMMAND_INDICATOR_TIME_MS = 5_000

const CodeButtonBlock = (props: Props) => {
  const {
    onApply,
    label,
    className,
    params,
    content,
    onCopy,
    modules = [],
    isShowConfirmation = true,
    ...rest
  } = props

  const [highlightedContent, setHighlightedContent] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRunned, setIsRunned] = useState(false)

  const { instanceId } = useParams<{ instanceId: string }>()

  const isButtonHasConfirmation = params?.run_confirmation === BooleanParams.true
  const isRunButtonHidden = params?.executable === BooleanParams.false
  const [notLoadedModule] = getUnsupportedModulesFromQuery(modules, content)

  useEffect(() => {
    monaco.editor.colorize(content.trim(), MonacoLanguage.Redis, {})
      .then((data) => {
        setHighlightedContent(data)
      })
  }, [])

  const getIsShowConfirmation = () => isShowConfirmation && !getDBConfigStorageField(
    instanceId,
    ConfigDBStorageItem.notShowConfirmationRunTutorial
  )

  const handleCopy = () => {
    const query = getCommandsForExecution(content)?.join('\n') || ''
    navigator?.clipboard?.writeText(query)
    onCopy?.()
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
    if (!instanceId
      || notLoadedModule
      || (getIsShowConfirmation() && isButtonHasConfirmation)
    ) {
      setIsPopoverOpen((v) => !v)
      return
    }

    runQuery()
  }

  const handleApplyRun = () => {
    handleClosePopover()
    runQuery()
  }

  const handleClosePopover = () => {
    setIsPopoverOpen(false)
  }

  const getPopoverMessage = (): React.ReactNode => {
    if (!instanceId) {
      return (<DatabaseNotOpened />)
    }

    if (notLoadedModule) {
      return (
        <ModuleNotLoadedMinimalized
          moduleName={notLoadedModule}
          source={OAuthSocialSource.Tutorials}
          onClose={() => setIsPopoverOpen(false)}
        />
      )
    }

    return (<RunConfirmationPopover onApply={handleApplyRun} />)
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
          {!isRunButtonHidden && (
            <EuiPopover
              ownFocus
              initialFocus={false}
              className={styles.popoverAnchor}
              panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
              anchorClassName={styles.popoverAnchor}
              anchorPosition="upLeft"
              isOpen={isPopoverOpen}
              panelPaddingSize="m"
              closePopover={handleClosePopover}
              focusTrapProps={{
                scrollLock: true
              }}
              button={(
                <EuiToolTip
                  anchorClassName={styles.popoverAnchor}
                  content={isPopoverOpen ? undefined : 'Open Workbench in the left menu to see the command results.'}
                  data-testid="run-btn-open-workbench-tooltip"
                >
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
                </EuiToolTip>
              )}
            >
              {getPopoverMessage()}
            </EuiPopover>
          )}
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
