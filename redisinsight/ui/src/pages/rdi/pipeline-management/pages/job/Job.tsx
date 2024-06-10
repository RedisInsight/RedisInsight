import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiText, EuiLink, EuiButton, EuiLoadingSpinner, EuiToolTip } from '@elastic/eui'
import { useFormikContext } from 'formik'
import { get, throttle } from 'lodash'
import cx from 'classnames'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { deleteChangedFile, rdiPipelineSelector, setChangedFile } from 'uiSrc/slices/rdi/pipeline'
import { FileChangeType, IPipeline, RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import MonacoYaml from 'uiSrc/components/monaco-editor/components/monaco-yaml'
import DryRunJobPanel from 'uiSrc/pages/rdi/pipeline-management/components/jobs-panel'
import { DSL, KEYBOARD_SHORTCUTS } from 'uiSrc/constants'
import TemplatePopover from 'uiSrc/pages/rdi/pipeline-management/components/template-popover'
import { isEqualPipelineFile, Maybe } from 'uiSrc/utils'
import { KeyboardShortcut } from 'uiSrc/components'

import styles from './styles.module.scss'

export interface Props {
  name: string
  value: string
  deployedJobValue: Maybe<string>
  jobIndex: number
  rdiInstanceId: string
}

const Job = (props: Props) => {
  const { name, value = '', deployedJobValue, jobIndex, rdiInstanceId } = props

  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)
  const [shouldOpenDedicatedEditor, setShouldOpenDedicatedEditor] = useState<boolean>(false)

  const dispatch = useDispatch()

  const jobIndexRef = useRef<number>(jobIndex)
  const deployedJobValueRef = useRef<Maybe<string>>(deployedJobValue)
  const jobNameRef = useRef<string>(name)

  const { loading, schema, jobFunctions } = useSelector(rdiPipelineSelector)

  const { setFieldValue } = useFormikContext<IPipeline>()

  useEffect(() => {
    setIsPanelOpen(false)
  }, [name])

  useEffect(() => {
    setIsPopoverOpen(!value)
  }, [value, name])

  useEffect(() => {
    deployedJobValueRef.current = deployedJobValue
  }, [deployedJobValue])

  useEffect(() => {
    jobIndexRef.current = jobIndex
  }, [jobIndex])

  useEffect(() => {
    jobNameRef.current = name
  }, [name])

  const handleDryRunJob = () => {
    setIsPanelOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_TEST_JOB_OPENED,
      eventData: {
        id: rdiInstanceId,
      },
    })
  }

  const checkIsFileUpdated = useCallback(throttle((value) => {
    if (!deployedJobValueRef.current) {
      return
    }

    if (isEqualPipelineFile(value, deployedJobValueRef.current)) {
      dispatch(deleteChangedFile(jobNameRef.current))
      return
    }
    dispatch(setChangedFile({ name: jobNameRef.current, status: FileChangeType.Modified }))
  }, 2000), [deployedJobValue, jobNameRef.current])

  const handleChange = (value: string) => {
    setFieldValue(`jobs.${jobIndexRef.current}.value`, value)
    checkIsFileUpdated(value)
  }

  const handleChangeLanguage = (langId: DSL) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_DEDICATED_EDITOR_LANGUAGE_CHANGED,
      eventData: {
        rdiInstanceId,
        selectedLanguageSyntax: langId,
      }
    })
  }

  const handleOpenDedicatedEditor = () => {
    setShouldOpenDedicatedEditor(false)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_DEDICATED_EDITOR_OPENED,
      eventData: {
        rdiInstanceId,
      }
    })
  }

  const handleCloseDedicatedEditor = (langId: DSL) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_DEDICATED_EDITOR_CANCELLED,
      eventData: {
        rdiInstanceId,
        selectedLanguageSyntax: langId,
      }
    })
  }

  const handleSubmitDedicatedEditor = (langId: DSL) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_DEDICATED_EDITOR_SAVED,
      eventData: {
        rdiInstanceId,
        selectedLanguageSyntax: langId,
      }
    })
  }

  return (
    <>
      <div className={cx('content', { isSidePanelOpen: isPanelOpen })}>
        <div className="rdi__content-header">
          <EuiText className={cx('rdi__title', 'line-clamp-2')}>{name}</EuiText>
          <div>
            <EuiToolTip
              position="top"
              className={styles.tooltip}
              content={
                KEYBOARD_SHORTCUTS?.rdi?.openDedicatedEditor && (
                  <div className={styles.tooltipContent}>
                    <EuiText size="s">{`${KEYBOARD_SHORTCUTS.rdi.openDedicatedEditor?.description}\u00A0\u00A0`}</EuiText>
                    <KeyboardShortcut
                      separator={KEYBOARD_SHORTCUTS?._separator}
                      items={KEYBOARD_SHORTCUTS.rdi.openDedicatedEditor.keys}
                    />
                  </div>
                )
              }
              data-testid="open-dedicated-editor-tooltip"
            >
              <EuiButton
                color="secondary"
                size="s"
                style={{ marginRight: '16px' }}
                onClick={() => setShouldOpenDedicatedEditor(true)}
                data-testid="open-dedicated-editor-btn"
              >
                SQL and JMESPath Editor
              </EuiButton>
            </EuiToolTip>
            <TemplatePopover
              isPopoverOpen={isPopoverOpen}
              setIsPopoverOpen={setIsPopoverOpen}
              value={value}
              setFieldValue={(template) => setFieldValue(`jobs.${jobIndexRef.current ?? -1}.value`, template)}
              loading={loading}
              source={RdiPipelineTabs.Jobs}
            />
          </div>
        </div>
        <EuiText className="rdi__text" color="subdued">
          {'Describe the '}
          <EuiLink
            external={false}
            data-testid="rdi-pipeline-transformation-link"
            target="_blank"
            href={EXTERNAL_LINKS.rdiTransformation}
          >
            transformation logic
          </EuiLink>
          {' to perform on data from a single source'}
        </EuiText>
        {loading ? (
          <div className={cx('rdi__editorWrapper', 'rdi__loading')} data-testid="rdi-job-loading">
            <EuiText color="subdued" style={{ marginBottom: 12 }}>Loading data...</EuiText>
            <EuiLoadingSpinner color="secondary" size="l" />
          </div>
        ) : (
          <MonacoYaml
            schema={get(schema, 'jobs', null)}
            value={value}
            onChange={handleChange}
            disabled={loading}
            dedicatedEditorLanguages={[DSL.sqliteFunctions, DSL.jmespath]}
            dedicatedEditorFunctions={jobFunctions as monacoEditor.languages.CompletionItem[]}
            dedicatedEditorOptions={{
              suggest: { preview: false, showIcons: true, showStatusBar: true }
            }}
            onChangeLanguage={handleChangeLanguage}
            wrapperClassName="rdi__editorWrapper"
            shouldOpenDedicatedEditor={shouldOpenDedicatedEditor}
            onOpenDedicatedEditor={handleOpenDedicatedEditor}
            onCloseDedicatedEditor={handleCloseDedicatedEditor}
            onSubmitDedicatedEditor={handleSubmitDedicatedEditor}
            data-testid="rdi-monaco-job"
          />
        )}

        <div className="rdi__actions">
          <EuiButton
            fill
            color="secondary"
            size="s"
            onClick={handleDryRunJob}
            isDisabled={isPanelOpen}
            data-testid="rdi-job-dry-run"
          >
            Dry Run
          </EuiButton>
        </div>
      </div>
      {isPanelOpen && (
        <DryRunJobPanel
          onClose={() => setIsPanelOpen(false)}
          job={value}
        />
      )}
    </>

  )
}

export default Job
