import { EuiButtonIcon } from '@elastic/eui'
import JSZip from 'jszip'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import UploadDialog from './components/upload-dialog/UploadDialog'

const Upload = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [file, setFile] = useState<File>()

  const { loading } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const validateZip = (zip: JSZip) => {
    // check if config.yaml exists
    if (zip.file('config.yaml') === null) {
      throw new Error('config.yaml is missing')
    }

    // check if job files exist
  }

  const handleUploadClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_CLICKED,
      eventData: {
        id: rdiInstanceId
      }
    })

    setIsModalVisible(true)
  }

  const handleConfirmModal = async () => {
    // un-zip config and job contents
    console.log(file)
    const zip = await JSZip.loadAsync(file)

    validateZip(zip)

    const config = await zip.file('config.yaml').async('string')
    Object.keys(zip.files).forEach(async (filename) => { const job = await zip.files[filename].async('string') })

    setIsModalVisible(false)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
  }

  const handleFileChangeModal = (file: File) => {
    setFile(file)
  }

  return (
    <>
      {isModalVisible && (
        <UploadDialog onClose={handleCloseModal} onConfirm={handleConfirmModal} onFileChange={handleFileChangeModal} />
      )}
      <EuiButtonIcon
        size="xs"
        iconSize="s"
        iconType="exportAction"
        disabled={loading}
        onClick={handleUploadClick}
        aria-labelledby="Upload pipeline button"
        data-testid="upload-pipeline-btn"
      />
    </>
  )
}

export default Upload
