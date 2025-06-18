import React, { useState } from 'react'
import {
  EuiModal,
  EuiModalBody,
  keys,
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  fetchRdiPipeline,
  setChangedFile,
  setPipeline,
} from 'uiSrc/slices/rdi/pipeline'
import {
  appContextPipelineManagement,
  setPipelineDialogState,
} from 'uiSrc/slices/app/context'
import UploadModal from 'uiSrc/pages/rdi/pipeline-management/components/upload-modal/UploadModal'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'

import { FileChangeType } from 'uiSrc/slices/interfaces'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import styles from './styles.module.scss'

export const EMPTY_PIPELINE = {
  config: '',
  jobs: [],
}

export enum PipelineSourceOptions {
  SERVER = 'download from server',
  FILE = 'upload from file',
  NEW = 'new pipeline',
}

const SourcePipelineDialog = () => {
  const [isShowDownloadDialog, setIsShowDownloadDialog] = useState(false)
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const { isOpenDialog } = useSelector(appContextPipelineManagement)

  const dispatch = useDispatch()

  const onSelect = (option: PipelineSourceOptions) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_START_OPTION_SELECTED,
      eventData: {
        id: rdiInstanceId,
        option,
      },
    })
  }

  const onLoadPipeline = () => {
    dispatch(fetchRdiPipeline(rdiInstanceId))
    onSelect(PipelineSourceOptions.SERVER)
    dispatch(setPipelineDialogState(false))
  }

  const onStartNewPipeline = () => {
    dispatch(setPipeline(EMPTY_PIPELINE))
    onSelect(PipelineSourceOptions.NEW)
    dispatch(setChangedFile({ name: 'config', status: FileChangeType.Added }))
    dispatch(setPipelineDialogState(false))
  }

  const handleCloseDialog = () => {
    dispatch(setPipeline(EMPTY_PIPELINE))
    dispatch(setChangedFile({ name: 'config', status: FileChangeType.Added }))
    dispatch(setPipelineDialogState(false))
  }

  const onUploadClick = () => {
    setIsShowDownloadDialog(true)
    onSelect(PipelineSourceOptions.FILE)
  }

  const onEnter = (
    event: React.KeyboardEvent<HTMLDivElement>,
    callback: () => void,
  ) => {
    if (event.key === keys.ENTER) callback()
  }

  if (isShowDownloadDialog) {
    return (
      <UploadModal
        onClose={() => dispatch(setPipelineDialogState(false))}
        visible={isShowDownloadDialog}
      />
    )
  }

  if (!isOpenDialog) {
    return null
  }

  return (
    <EuiModal
      className={styles.container}
      onClose={handleCloseDialog}
      data-testid="rdi-pipeline-source-dialog"
    >
      <EuiModalBody>
        <div className={styles.content}>
          <Title size="L" className={styles.title}>
            Start with your pipeline
          </Title>
          <div className={styles.actions}>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(event) => onEnter(event, onLoadPipeline)}
              onClick={onLoadPipeline}
              className={styles.action}
              data-testid="server-source-pipeline-dialog"
            >
              <RiIcon type="UploadIcon" size="xl" className={styles.icon} />
              <Text className={styles.text}>Download from server</Text>
            </div>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(event) => onEnter(event, onUploadClick)}
              onClick={onUploadClick}
              className={styles.action}
              data-testid="file-source-pipeline-dialog"
            >
              <RiIcon type="ExportIcon" size="xl" className={styles.icon} />
              <Text className={styles.text}>Upload from file</Text>
            </div>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(event) => onEnter(event, onStartNewPipeline)}
              onClick={onStartNewPipeline}
              className={styles.action}
              data-testid="empty-source-pipeline-dialog"
            >
              <RiIcon type="ContractsIcon" size="xl" className={styles.icon} />
              <Text className={styles.text}>Create new pipeline</Text>
            </div>
          </div>
        </div>
      </EuiModalBody>
    </EuiModal>
  )
}

export default SourcePipelineDialog
