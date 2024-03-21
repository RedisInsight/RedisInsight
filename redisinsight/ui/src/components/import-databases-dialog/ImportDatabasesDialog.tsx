import cx from 'classnames'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import ImportFileModal from 'uiSrc/components/import-file-modal/ImportFileModal'
import {
  fetchInstancesAction,
  importInstancesSelector,
  resetImportInstances,
  uploadInstancesFile
} from 'uiSrc/slices/instances/instances'
import { ImportDatabasesData } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { Nullable } from 'uiSrc/utils'

import ResultsLog from './components/ResultsLog'
import styles from './styles.module.scss'

export interface Props {
  onClose: (isCancelled: boolean) => void
}

const MAX_MB_FILE = 10
const MAX_FILE_SIZE = MAX_MB_FILE * 1024 * 1024

const ImportDatabasesDialog = ({ onClose }: Props) => {
  const { loading, data, error } = useSelector(importInstancesSelector)
  const [files, setFiles] = useState<Nullable<FileList>>(null)
  const [isInvalid, setIsInvalid] = useState<boolean>(false)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)

  const dispatch = useDispatch()

  const onFileChange = (files: FileList | null) => {
    setFiles(files)
    setIsInvalid(!!files?.length && files?.[0].size > MAX_FILE_SIZE)
    setIsSubmitDisabled(!files?.length || files[0].size > MAX_FILE_SIZE)
  }

  const handleOnClose = () => {
    if (data?.success?.length || data?.partial?.length) {
      dispatch(fetchInstancesAction())
    }
    onClose(!data)
    dispatch(resetImportInstances())
  }

  const onSubmit = () => {
    if (files) {
      const formData = new FormData()
      formData.append('file', files[0])

      dispatch(uploadInstancesFile(formData))

      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_SUBMITTED
      })
    }
  }

  return (
    <ImportFileModal<ImportDatabasesData>
      onClose={handleOnClose}
      onFileChange={onFileChange}
      onSubmit={onSubmit}
      modalClassName={cx(styles.modal, { [styles.result]: !!data })}
      title="Import Database Connections"
      submitResults={<ResultsLog data={data} />}
      loading={loading}
      data={data}
      error={error}
      errorMessage="Failed to add database connections"
      invalidMessage={`File should not exceed ${MAX_MB_FILE} MB`}
      isInvalid={isInvalid}
      isSubmitDisabled={isSubmitDisabled}
    />
  )
}

export default ImportDatabasesDialog
