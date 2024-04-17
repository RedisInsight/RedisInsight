import { EuiButtonEmpty } from '@elastic/eui'
import { saveAs } from 'file-saver'
import { useFormikContext } from 'formik'
import JSZip from 'jszip'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { IPipeline } from 'uiSrc/slices/interfaces'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

const Download = () => {
  const { loading } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const { values } = useFormikContext<IPipeline>()

  const handleDownloadClick = async () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_DOWNLOAD_CLICKED,
      eventData: {
        id: rdiInstanceId,
        jobsNumber: values?.jobs?.length
      }
    })

    // zip config and job contents
    const zip = new JSZip()
    zip.file('config.yaml', values?.config || '')

    const jobs = zip.folder('jobs')
    values?.jobs.forEach(({ name, value }) => jobs?.file(`${name}.yaml`, value))

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'RDI_pipeline.zip')
  }

  return (
    <EuiButtonEmpty
      color="text"
      size="xs"
      iconType="exportAction"
      disabled={loading}
      onClick={handleDownloadClick}
      aria-labelledby="Download pipeline button"
      data-testid="download-pipeline-btn"
    >
      Download
    </EuiButtonEmpty>
  )
}

export default Download
