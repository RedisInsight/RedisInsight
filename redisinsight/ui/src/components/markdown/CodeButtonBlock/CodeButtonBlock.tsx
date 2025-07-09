import { EuiPopover } from '@elastic/eui'
import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { monaco } from 'react-monaco-editor'
import parse from 'html-react-parser'
import { useParams } from 'react-router-dom'
import { find } from 'lodash'
import {
  getCommandsForExecution,
  getUnsupportedModulesFromQuery,
  truncateText,
} from 'uiSrc/utils'
import {
  BooleanParams,
  CodeButtonParams,
  MonacoLanguage,
} from 'uiSrc/constants'

import { CodeBlock, RiTooltip } from 'uiSrc/components'
import { getDBConfigStorageField } from 'uiSrc/services'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import {
  ModuleNotLoadedMinimalized,
  DatabaseNotOpened,
} from 'uiSrc/components/messages'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { ButtonLang } from 'uiSrc/utils/formatters/markdown/remarkCode'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { PlayIcon, CheckBoldIcon, CopyIcon } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import { RunConfirmationPopover } from './components'
import styles from './styles.module.scss'

export interface Props {
  content: string
  onApply?: (params?: CodeButtonParams, onFinish?: () => void) => void
  modules?: AdditionalRedisModule[]
  onCopy?: () => void
  label?: string
  isLoading?: boolean
  className?: string
  params?: CodeButtonParams
  isShowConfirmation?: boolean
  lang?: string
}

const FINISHED_COMMAND_INDICATOR_TIME_MS = 5_000

const CodeButtonBlock = (props: Props) => {
  const {
    lang,
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

  const isButtonHasConfirmation =
    params?.run_confirmation === BooleanParams.true
  const isRunButtonHidden = params?.executable === BooleanParams.false
  const [notLoadedModule] = isRunButtonHidden
    ? []
    : getUnsupportedModulesFromQuery(modules, content)

  useEffect(() => {
    if (!lang) return

    const languageId =
      lang === ButtonLang.Redis
        ? MonacoLanguage.Redis
        : find(monaco.languages?.getLanguages(), ({ id }) => id === lang)?.id

    if (languageId) {
      monaco.editor.colorize(content.trim(), languageId, {}).then((data) => {
        setHighlightedContent(data)
      })
    }
  }, [])

  const getIsShowConfirmation = () =>
    isShowConfirmation &&
    !getDBConfigStorageField(
      instanceId,
      ConfigDBStorageItem.notShowConfirmationRunTutorial,
    )

  const handleCopy = () => {
    const query = getCommandsForExecution(content)?.join('\n') || ''
    navigator?.clipboard?.writeText(query)
    onCopy?.()
  }

  const runQuery = () => {
    setIsLoading(true)
    onApply?.(params, () => {
      setIsLoading(false)
      setIsRunned(true)
      setTimeout(() => setIsRunned(false), FINISHED_COMMAND_INDICATOR_TIME_MS)
    })
  }

  const handleRunClicked = () => {
    if (
      !instanceId ||
      notLoadedModule ||
      (getIsShowConfirmation() && isButtonHasConfirmation)
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
      return <DatabaseNotOpened />
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

    return <RunConfirmationPopover onApply={handleApplyRun} />
  }

  return (
    <div className={styles.wrapper}>
      <Row>
        <FlexItem grow>
          {!!label && (
            <Title
              size="XS"
              className={styles.label}
              data-testid="code-button-block-label"
            >
              {truncateText(label, 86)}
            </Title>
          )}
        </FlexItem>
        <FlexItem className={styles.actions}>
          <EmptyButton
            onClick={handleCopy}
            icon={CopyIcon}
            size="small"
            className={cx(styles.actionBtn, styles.copyBtn)}
            data-testid={`copy-btn-${label}`}
          >
            Copy
          </EmptyButton>
          {!isRunButtonHidden && (
            <EuiPopover
              ownFocus
              initialFocus={false}
              className={styles.popoverAnchor}
              panelClassName={cx('popoverLikeTooltip', styles.popover)}
              anchorClassName={styles.popoverAnchor}
              anchorPosition="upLeft"
              isOpen={isPopoverOpen}
              panelPaddingSize="m"
              closePopover={handleClosePopover}
              focusTrapProps={{
                scrollLock: true,
              }}
              button={
                <RiTooltip
                  content={
                    isPopoverOpen
                      ? undefined
                      : 'Open Workbench in the left menu to see the command results.'
                  }
                  data-testid="run-btn-open-workbench-tooltip"
                >
                  <EmptyButton
                    onClick={handleRunClicked}
                    icon={isRunned ? CheckBoldIcon : PlayIcon}
                    iconSide="right"
                    size="small"
                    disabled={isLoading || isRunned}
                    loading={isLoading}
                    className={cx(styles.actionBtn, styles.runBtn)}
                    {...rest}
                    data-testid={`run-btn-${label}`}
                  >
                    Run
                  </EmptyButton>
                </RiTooltip>
              }
            >
              {getPopoverMessage()}
            </EuiPopover>
          )}
        </FlexItem>
      </Row>
      <div className={styles.content} data-testid="code-button-block-content">
        <CodeBlock className={styles.code}>
          {highlightedContent ? parse(highlightedContent) : content}
        </CodeBlock>
      </div>
      <Spacer size="s" />
    </div>
  )
}

export default CodeButtonBlock
