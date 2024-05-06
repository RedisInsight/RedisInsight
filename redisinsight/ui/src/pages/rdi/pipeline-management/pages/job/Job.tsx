import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiText, EuiLink, EuiButton, EuiLoadingSpinner } from '@elastic/eui'
import { useFormikContext } from 'formik'
import { get, throttle } from 'lodash'
import cx from 'classnames'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { deleteChangedFile, rdiPipelineSelector, setChangedFile } from 'uiSrc/slices/rdi/pipeline'
import { FileChangeType, IPipeline, RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import MonacoYaml from 'uiSrc/components/monaco-editor/components/monaco-yaml'
import DryRunJobPanel from 'uiSrc/pages/rdi/pipeline-management/components/jobs-panel'
import { DSL } from 'uiSrc/constants'
import TemplatePopover from 'uiSrc/pages/rdi/pipeline-management/components/template-popover'
import { isEqualPipelineFile, Maybe } from 'uiSrc/utils'

export interface Props {
  name: string
  value: string
  deployedJobValue: Maybe<string>
  jobIndex: number
  rdiInstanceId: string
}

const Job = (props: Props) => {
  const { name, value, deployedJobValue, jobIndex, rdiInstanceId } = props

  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const dispatch = useDispatch()

  const jobIndexRef = useRef<number>(jobIndex)
  const deployedJobValueRef = useRef<Maybe<string>>(deployedJobValue)
  const jobNameRef = useRef<string>(name)

  const { loading, schema } = useSelector(rdiPipelineSelector)

  const { setFieldValue } = useFormikContext<IPipeline>()

  useEffect(() => {
    setIsPanelOpen(false)
  }, [name])

  useEffect(() => {
    setIsPopoverOpen(!value)
  }, [value])

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

  return (
    <>
      <div className={cx('content', { isSidePanelOpen: isPanelOpen })}>
        <div className="rdi__content-header">
          <EuiText className={cx('rdi__title', 'line-clamp-2')}>{name}</EuiText>
          <TemplatePopover
            isPopoverOpen={isPopoverOpen}
            setIsPopoverOpen={setIsPopoverOpen}
            value={value}
            setFieldValue={(template) => setFieldValue(`jobs.${jobIndexRef.current ?? -1}.value`, template)}
            loading={loading}
            source={RdiPipelineTabs.Jobs}
          />
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
            dedicatedEditorLanguages={[DSL.sql, DSL.jmespath]}
            wrapperClassName="rdi__editorWrapper"
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
