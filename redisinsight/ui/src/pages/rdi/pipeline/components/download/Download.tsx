import { EuiButtonIcon } from '@elastic/eui'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

const Download = () => {
  const { loading, data } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const handleDownloadClick = async () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_DOWNLOAD_CLICKED,
      eventData: {
        id: rdiInstanceId,
        jobsNumber: data?.jobs?.length
      }
    })

    // zip config and job contents
    const zip = new JSZip()
    zip.file('config.yaml', data?.config || '')

    const jobs = zip.folder('jobs')
    data?.jobs.forEach(({ name, value }) => jobs?.file(`${name}.yaml`, value))

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'RDI_pipeline.zip')
  }

  return (
    <EuiButtonIcon
      size="xs"
      iconSize="s"
      iconType="download"
      disabled={loading}
      onClick={handleDownloadClick}
      aria-labelledby="Download pipeline button"
      data-testid="download-pipeline-btn"
    />
  )
}

export default Download
