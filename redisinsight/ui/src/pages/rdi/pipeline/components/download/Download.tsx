import { EuiButtonIcon } from '@elastic/eui'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import styles from './styles.module.scss'

const Download = () => {
  const { loading, data } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const handleDownloadClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_DOWNLOAD_CLICKED,
      eventData: {
        id: rdiInstanceId,
        jobsNumber: data?.jobs?.length
      }
    })
  }

  return (
    <EuiButtonIcon
      size="xs"
      iconSize="s"
      iconType="download"
      disabled={loading}
      onClick={handleDownloadClick}
      className={styles.trigger}
      aria-labelledby="Download pipeline button"
      data-testid="download-pipeline-btn"
    />
  )
}

export default Download
