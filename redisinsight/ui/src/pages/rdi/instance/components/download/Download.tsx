import { EuiButtonEmpty } from '@elastic/eui'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import saveIcon from 'uiSrc/assets/img/rdi/save.svg?react'

import styles from './styles.module.scss'

interface Props {
  dataTestid?: string
  onClose?: () => void
}

const Download = ({ dataTestid, onClose }: Props) => {
  const { loading, jobs, config } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const handleDownloadClick = async () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_DOWNLOAD_CLICKED,
      eventData: {
        id: rdiInstanceId,
        jobsNumber: jobs?.length
      }
    })

    // zip config and job contents
    const zip = new JSZip()
    zip.file('config.yaml', config || '')

    const rdiJobs = zip.folder('jobs')
    jobs.forEach(({ name, value }) => rdiJobs?.file(`${name}.yaml`, value))

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'RDI_pipeline.zip')

    onClose?.()
  }

  return (
    <EuiButtonEmpty
      color="text"
      className={styles.downloadBtn}
      iconSize="m"
      iconType={saveIcon}
      disabled={loading}
      onClick={handleDownloadClick}
      aria-labelledby="Download pipeline button"
      data-testid={dataTestid || 'download-pipeline-btn'}
    >
      Save to file
    </EuiButtonEmpty>
  )
}

export default Download
