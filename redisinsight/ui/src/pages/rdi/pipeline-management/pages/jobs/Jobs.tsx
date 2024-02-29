import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { EuiText, EuiLink, EuiButton, EuiLoadingSpinner } from '@elastic/eui'
import { useFormikContext } from 'formik'
import { findIndex, get } from 'lodash'
import cx from 'classnames'

import { sendPageViewTelemetry, TelemetryPageView, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { IPipeline, RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import MonacoYaml from 'uiSrc/components/monaco-editor/components/monaco-yaml'
import DryRunJobPanel from 'uiSrc/pages/rdi/pipeline-management/components/jobs-panel'
import { DSL, Pages } from 'uiSrc/constants'
import TemplatePopover from 'uiSrc/pages/rdi/pipeline-management/components/template-popover'

const Jobs = () => {
  const { rdiInstanceId, jobName } = useParams<{ rdiInstanceId: string, jobName: string }>()
  const [decodedJobName, setDecodedJobName] = useState<string>(decodeURIComponent(jobName))
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)
  const [editorValue, setEditorValue] = useState<string>('')

  const jobIndexRef = useRef<number>()

  const history = useHistory()

  const { loading, schema, data } = useSelector(rdiPipelineSelector)

  const { values, setFieldValue } = useFormikContext<IPipeline>()

  useEffect(() => {
    const jobIndex = findIndex(values?.jobs, (({ name }) => name === decodedJobName))

    if (jobIndex === -1) {
      history.push(Pages.rdiPipelineConfig(rdiInstanceId))
    }

    jobIndexRef.current = jobIndex
    setEditorValue(values.jobs?.[jobIndexRef.current ?? -1]?.value)
  }, [values, rdiInstanceId, decodedJobName, history])

  useEffect(() => {
    setDecodedJobName(decodeURIComponent(jobName))
    setIsPanelOpen(false)
  }, [jobName])

  useEffect(() => {
    if (data !== null && !values.jobs?.[jobIndexRef.current ?? -1]?.value) {
      setIsPopoverOpen(true)
    }
  }, [jobName, data])

  useEffect(() => {
    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_JOBS,
    })
  }, [])

  const handleDryRunJob = () => {
    setIsPanelOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_TEST_JOB_OPENED,
      eventData: {
        id: rdiInstanceId,
      },
    })
  }

  return (
    <>
      <div className={cx('content', { isSidePanelOpen: isPanelOpen })}>
        <div className="rdi__content-header">
          <EuiText className={cx('rdi__title', 'line-clamp-2')}>{decodedJobName}</EuiText>
          <TemplatePopover
            isPopoverOpen={isPopoverOpen}
            setIsPopoverOpen={setIsPopoverOpen}
            value={values.jobs?.[jobIndexRef.current ?? -1]?.value ?? ''}
            setFieldValue={(template) => setFieldValue(`jobs.${jobIndexRef.current}.value`, template)}
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
          <div className={cx('rdi__editorWrapper', 'rdi__loading')} data-testid="rdi-jobs-loading">
            <EuiText color="subdued" style={{ marginBottom: 12 }}>Loading data...</EuiText>
            <EuiLoadingSpinner color="secondary" size="l" />
          </div>
        ) : (
          <MonacoYaml
            schema={get(schema, 'jobs', null)}
            value={editorValue}
            onChange={(value) => setFieldValue(`jobs.${jobIndexRef.current}.value`, value)}
            disabled={loading}
            dedicatedEditorLanguages={[DSL.sql, DSL.jmespath]}
            wrapperClassName="rdi__editorWrapper"
            data-testid="rdi-monaco-jobs"
          />
        )}

        <div className="rdi__actions">
          <EuiButton
            fill
            color="secondary"
            size="s"
            onClick={handleDryRunJob}
            isDisabled={isPanelOpen}
            data-testid="rdi-jobs-dry-run"
          >
            Dry Run
          </EuiButton>
        </div>
      </div>
      {isPanelOpen && (
        <DryRunJobPanel
          onClose={() => setIsPanelOpen(false)}
          job={values.jobs?.[jobIndexRef.current ?? -1]?.value ?? ''}
        />
      )}
    </>

  )
}

export default Jobs
