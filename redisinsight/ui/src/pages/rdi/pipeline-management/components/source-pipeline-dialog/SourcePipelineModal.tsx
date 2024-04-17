import React, { useState } from 'react'
import {
  EuiButtonEmpty,
  EuiIcon,
  EuiModal,
  EuiModalBody,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { fetchRdiPipeline, setPipeline } from 'uiSrc/slices/rdi/pipeline'
import { appContextPipelineManagement, setPipelineDialogState } from 'uiSrc/slices/app/context'
import UploadModal from 'uiSrc/pages/rdi/pipeline-management/components/upload-modal/UploadModal'
import { ReactComponent as UploadIcon } from 'uiSrc/assets/img/rdi/upload_from_server.svg'

import styles from './styles.module.scss'

export const EMPTY_PIPELINE = {
  config: '',
  jobs: []
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
    dispatch(setPipelineDialogState(false))
  }

  const handleCloseDialog = () => {
    dispatch(setPipeline(EMPTY_PIPELINE))
    dispatch(setPipelineDialogState(false))
  }

  const onUploadClick = () => {
    setIsShowDownloadDialog(true)
    onSelect(PipelineSourceOptions.FILE)
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
    <EuiModal className={styles.container} onClose={handleCloseDialog} data-testid="rdi-pipeline-source-dialog">
      <EuiModalBody>
        <div className={styles.content}>
          <EuiTitle size="s">
            <h3 className={styles.title}>Select an option<br /> to start with your pipeline</h3>
          </EuiTitle>
          <div className={styles.actions}>
            <div className={styles.action}>
              <EuiIcon type={UploadIcon} size="xl" className={styles.icon} />
              <EuiText className={styles.text}>Upload from server</EuiText>
              <EuiButtonEmpty
                onClick={onLoadPipeline}
                className={styles.btn}
                data-testid="server-source-pipeline-dialog"
              >
                Sync
              </EuiButtonEmpty>
            </div>
            <div className={styles.action}>
              <EuiIcon type="exportAction" size="xl" className={styles.icon} />
              <EuiText className={styles.text}>Upload from file</EuiText>
              <EuiButtonEmpty
                onClick={onUploadClick}
                className={styles.btn}
                data-testid="file-source-pipeline-dialog"
              >
                Upload
              </EuiButtonEmpty>
            </div>
            <div className={styles.action}>
              <EuiIcon type="document" size="xl" className={styles.icon} />
              <EuiText className={styles.text}>Start new pipeline</EuiText>
              <EuiButtonEmpty
                onClick={onStartNewPipeline}
                className={styles.btn}
                data-testid="empty-source-pipeline-dialog"
              >
                Start
              </EuiButtonEmpty>
            </div>
          </div>
        </div>
      </EuiModalBody>
    </EuiModal>
  )
}

export default SourcePipelineDialog
