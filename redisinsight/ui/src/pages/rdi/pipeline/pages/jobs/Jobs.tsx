import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { EuiText, EuiLink, EuiButton, EuiLoadingSpinner } from '@elastic/eui'
import { useFormikContext } from 'formik'
import { findIndex } from 'lodash'
import cx from 'classnames'

import { sendPageViewTelemetry, TelemetryPageView, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { IPipeline } from 'uiSrc/slices/interfaces'
import { MonacoYaml } from 'uiSrc/components/monaco-editor'

import DryRunJobPanel from 'uiSrc/pages/rdi/pipeline/components/jobs-panel'

const Jobs = () => {
  const { rdiInstanceId, jobName } = useParams<{ rdiInstanceId: string, jobName: string }>()
  const [decodedJobName, setDecodedJobName] = useState<string>(decodeURIComponent(jobName))
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
  const [jobIndex, setJobIndex] = useState<number>(-1)

  const history = useHistory()

  const { loading } = useSelector(rdiPipelineSelector)

  const { values, setFieldValue } = useFormikContext<IPipeline>()

  useEffect(() => {
    const jobIndex = findIndex(values?.jobs, (({ name }) => name === decodedJobName))

    setJobIndex(jobIndex)
  }, [values, rdiInstanceId, decodedJobName, history])

  useEffect(() => {
    setDecodedJobName(decodeURIComponent(jobName))
    setIsPanelOpen(false)
  }, [jobName])

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
        <EuiText className={cx('rdi__title', 'line-clamp-2')}>{decodedJobName}</EuiText>
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
            value={values.jobs?.[jobIndex]?.value ?? ''}
            onChange={(value) => setFieldValue(`jobs.${jobIndex}.value`, value)}
            disabled={loading}
            wrapperClassName="rdi__editorWrapper"
            data-testid="rdi-config"
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
        <DryRunJobPanel onClose={() => setIsPanelOpen(false)} job={values.jobs?.[jobIndex]?.value ?? ''} />
      )}
    </>

  )
}

export default Jobs
