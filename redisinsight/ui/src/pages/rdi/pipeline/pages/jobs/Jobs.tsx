import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { EuiText, EuiLink, EuiButton, EuiLoadingSpinner } from '@elastic/eui'
import cx from 'classnames'

import { Pages } from 'uiSrc/constants'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { MonacoYaml } from 'uiSrc/components/monaco-editor'

const Jobs = () => {
  const { rdiInstanceId, jobName } = useParams<{ rdiInstanceId: string, jobName: string }>()
  const [decodedJobName, setDecodedJobName] = useState(decodeURIComponent(jobName))
  const history = useHistory()

  const { loading, data } = useSelector(rdiPipelineSelector)

  const [value, setValue] = useState<string>('')

  useEffect(() => {
    const job = data?.jobs.find(({ name }) => name === decodedJobName)

    if (job) {
      setValue(job?.value ?? '')
    }

    if (data?.jobs && !job) {
      history.push(Pages.rdiPipelineConfig(rdiInstanceId))
    }
  }, [data, rdiInstanceId, decodedJobName])

  useEffect(() => {
    setDecodedJobName(decodeURIComponent(jobName))
  }, [jobName])

  useEffect(() => {
    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_JOBS,
    })
  }, [])

  return (
    <div className="content">
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
          value={value}
          onChange={setValue}
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
          onClick={() => {}}
          data-testid="rdi-jobs-dry-run"
        >
          Dry Run
        </EuiButton>
      </div>
    </div>
  )
}

export default Jobs
