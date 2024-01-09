import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import {
  EuiButton,
  EuiButtonIcon,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  keys,
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import parse from 'html-react-parser'
import { monaco } from 'react-monaco-editor'

import { useParams } from 'react-router-dom'
import { PipelineJobsTabs } from 'uiSrc/slices/interfaces/rdi'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { CodeBlock } from 'uiSrc/components'
import { rdiDryRunJobSelector, rdiDryRunJob, setInitialDryRunJob } from 'uiSrc/slices/rdi/dryRun'
import { MonacoLanguage } from 'uiSrc/constants'
import MonacoJson from 'uiSrc/components/monaco-editor/components/monaco-json'

import styles from './styles.module.scss'

export interface Props {
  job: string
  onClose: () => void
}

const DryRunJobPanel = (props: Props) => {
  const { job, onClose } = props
  const { loading: isDryRunning, results } = useSelector(rdiDryRunJobSelector)

  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [selectedTab, changeSelectedTab] = useState<PipelineJobsTabs>(PipelineJobsTabs.Transformations)
  const [input, setInput] = useState<string>('')
  const [transformations, setTransformations] = useState('')
  const [commands, setCommands] = useState('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  useEffect(() => {
    window.addEventListener('keydown', handleEscFullScreen)
    return () => {
      window.removeEventListener('keydown', handleEscFullScreen)
    }
  }, [isFullScreen])

  useEffect(() => {
    try {
      JSON.parse(input)
      setIsFormValid(true)
    } catch (e) {
      setIsFormValid(false)
    }
  }, [input])

  useEffect(() => {
    if (results && results.transformations?.status === 'success') {
      try {
        const transformations = JSON.stringify(results.transformations?.data, null, 2)
        setTransformations(transformations)
      } catch (e) {
        setTransformations(results.transformations?.data ?? '')
      }
    }

    if (results && results.transformations?.status === 'failed') {
      setTransformations(results.transformations?.error ?? '')
    }

    if (results && results.commands?.status === 'success') {
      try {
        monaco.editor.colorize(results.commands?.data.join('\n').trim(), MonacoLanguage.Redis, {})
          .then((data) => {
            setCommands(data)
          })
      } catch (e) {
        setCommands(results?.commands.data)
      }
    }

    if (results && results?.commands?.status === 'failed') {
      setCommands(`<span className=${styles.error}>${results?.commands.error ?? ''}</span>`)
    }
  }, [results])

  // componentWillUnmount
  useEffect(() => () => {
    dispatch(setInitialDryRunJob())
  }, [])

  const handleEscFullScreen = (event: KeyboardEvent) => {
    if (event.key === keys.ESCAPE && isFullScreen) {
      handleFullScreen()
    }
  }

  const handleClose = () => {
    onClose()
  }

  const handleChangeTab = (name: PipelineJobsTabs) => {
    if (selectedTab === name) return

    changeSelectedTab(name)
  }

  const handleFullScreen = () => {
    setIsFullScreen((value) => !value)
  }

  const handleDryRun = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_TEST_JOB_RUN,
      eventData: {
        id: rdiInstanceId,
      },
    })
    dispatch(rdiDryRunJob(rdiInstanceId, input, job))
  }

  const Tabs = useCallback(() => (
    <EuiTabs className={styles.tabs}>
      <EuiTab
        isSelected={selectedTab === PipelineJobsTabs.Transformations}
        onClick={() => handleChangeTab(PipelineJobsTabs.Transformations)}
        className={styles.tab}
        data-testid="transformations-tab"
      >
        <span className={styles.tabName}>Transformations</span>
      </EuiTab>
      <EuiTab
        isSelected={selectedTab === PipelineJobsTabs.Output}
        onClick={() => handleChangeTab(PipelineJobsTabs.Output)}
        className={styles.tab}
        data-testid="output-tab"
      >
        <>
          <span className={styles.tabName}>Output</span>
        </>
      </EuiTab>
    </EuiTabs>
  ), [selectedTab, isFullScreen])

  return (
    <div
      className={cx(styles.panel, { [styles.fullScreen]: isFullScreen })}
      data-testid="dry-run-panel"
    >
      <div className={styles.panelInner}>
        <div className={styles.header}>
          <EuiText className={styles.title}>Test transformation logic</EuiText>
          <div>
            <EuiButtonIcon
              iconSize="m"
              iconType={isFullScreen ? 'fullScreenExit' : 'fullScreen'}
              color="primary"
              aria-label="toggle fullscrenn dry run panel"
              className={styles.fullScreenBtn}
              onClick={handleFullScreen}
              data-testid="fullScreen-dry-run-btn"
            />
            <EuiButtonIcon
              iconSize="m"
              iconType="cross"
              color="primary"
              aria-label="close dry run panel"
              className={styles.closeBtn}
              onClick={handleClose}
              data-testid="close-dry-run-btn"
            />
          </div>
        </div>
        <div className={styles.body}>
          <EuiText className={styles.text}>Add input data to test the transformation logic.</EuiText>
          <div className={styles.codeLabel}>
            <EuiText>Input</EuiText>
          </div>
          <MonacoJson
            value={input}
            onChange={setInput}
            disabled={false}
            wrapperClassName={styles.inputCode}
            data-testid="input-value"
          />
          <EuiFlexGroup gutterSize="none" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton
                onClick={handleDryRun}
                iconType="play"
                iconSide="right"
                color="success"
                size="s"
                disabled={isDryRunning || !isFormValid}
                isLoading={isDryRunning}
                className={cx(styles.actionBtn, styles.runBtn)}
                data-testid="dry-run-btn"
              >
                Dry run
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
          <div className={cx(styles.tabsWrapper, styles.codeLabel)}>
            <EuiText>Results</EuiText>
            <Tabs />
          </div>
          {selectedTab === PipelineJobsTabs.Transformations && (
            <>
              {results?.transformations?.status === 'failed' ? (
                <div className={styles.codeBlock} data-testid="transformations-output">
                  <CodeBlock className={styles.code}>
                    <span className={styles.error}>{transformations}</span>
                  </CodeBlock>
                </div>
              ) : (
                <MonacoJson
                  readOnly
                  value={transformations}
                  wrapperClassName={styles.outputCode}
                  data-testid="transformations-output"
                />
              ) }
            </>
          )}
          {selectedTab === PipelineJobsTabs.Output && (
            <div className={styles.codeBlock} data-testid="commands-output">
              <CodeBlock className={styles.code}>
                {parse(commands)}
              </CodeBlock>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DryRunJobPanel
