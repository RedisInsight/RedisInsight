import { useFormikContext } from 'formik'
import JSZip from 'jszip'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { IPipeline } from 'uiSrc/slices/interfaces'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import UploadDialog from './components/upload-dialog/UploadDialog'

export interface Props {
  children: React.ReactElement
}

const UploadModal = ({ children }: Props) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [file, setFile] = useState<File>()
  const [isUploaded, setIsUploaded] = useState(false)
  const [error, setError] = useState<string>()

  const { loading } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const { values, setFieldValue, resetForm } = useFormikContext<IPipeline>()

  const validateZip = (zip: JSZip) => {
    // check if config.yaml exists
    if (zip.file('config.yaml') === null) {
      throw new Error('config.yaml is missing')
    }

    // check if job files exist
    const jobFiles = Object.keys(zip.files).filter((filename) => filename.startsWith('jobs/'))
    if (!jobFiles.length) {
      throw new Error('No jobs folder found')
    }
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
    if (!file) {
      return
    }

    // unzip config and job contents and set form values
    try {
      const zip = await JSZip.loadAsync(file)

      validateZip(zip)

      const config = await zip.file('config.yaml')?.async('string')
      const jobs = await Promise.all(
        Object.keys(zip.files)
          .filter((filename) => filename.startsWith('jobs/') && filename.endsWith('.yaml'))
          .map(async (filename) => ({
            name: filename.split('/')[1].split('.')[0],
            value: await zip.files[filename].async('string')
          }))
      )

      resetForm()
      setFieldValue('config', config)
      setFieldValue('jobs', jobs)

      sendEventTelemetry({
        event: TelemetryEvent.RDI_PIPELINE_UPLOAD_SUCCEEDED,
        eventData: {
          id: rdiInstanceId,
          jobsNumber: jobs.length
        }
      })

      setIsUploaded(true)
    } catch (err) {
      const errorMessage = (err as Error).message

      sendEventTelemetry({
        event: TelemetryEvent.RDI_PIPELINE_UPLOAD_FAILED,
        eventData: {
          id: rdiInstanceId,
          errorMessage
        }
      })

      setError(errorMessage)
    }
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setIsUploaded(false)
    setError(undefined)
  }

  const handleFileChangeModal = (file: File) => {
    setFile(file)
  }

  const button = React.cloneElement(children, { disabled: loading, onClick: handleUploadClick })

  return (
    <>
      {isModalVisible && (
        <UploadDialog
          onClose={handleCloseModal}
          onConfirm={handleConfirmModal}
          onFileChange={handleFileChangeModal}
          isUploaded={isUploaded}
          showWarning={(!!values?.config || !!values?.jobs?.length) && !isUploaded && !error}
          error={error}
          loading={loading}
        />
      )}
      {button}
    </>
  )
}

export default UploadModal
