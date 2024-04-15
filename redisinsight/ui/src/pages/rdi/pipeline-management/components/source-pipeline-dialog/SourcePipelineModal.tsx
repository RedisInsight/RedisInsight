import React from 'react'
import {
  EuiButtonEmpty,
  EuiIcon,
  EuiModal,
  EuiModalBody,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { fetchRdiPipeline, setPipeline } from 'uiSrc/slices/rdi/pipeline'
import { setPipelineDialogState } from 'uiSrc/slices/app/context'

import UploadModal from 'uiSrc/pages/rdi/pipeline-management/components/upload-modal/UploadModal'
import styles from './styles.module.scss'

export const EMPTY_PIPELINE = {
  config: '',
  jobs: []
}

const SourcePipelineDialog = () => {
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  const onSelect = () => {
    dispatch(setPipelineDialogState(false))
    sendEventTelemetry({
      event: TelemetryEvent.RDI_START_OPTION_SELECTED,
      eventData: {
        id: rdiInstanceId,
      },
    })
  }

  const onLoadPipeline = () => {
    dispatch(fetchRdiPipeline(rdiInstanceId))
    onSelect()
  }

  const onStartNewPipeline = () => {
    dispatch(setPipeline(EMPTY_PIPELINE))
    onSelect()
  }

  return (
    <EuiModal className={styles.container} onClose={() => {}} data-testid="oauth-select-account-dialog">
      <EuiModalBody className={styles.modalBody}>
        <section className={styles.content}>
          <EuiTitle size="s">
            <h3 className={styles.title}>Select an option<br /> to start with your pipeline</h3>
          </EuiTitle>
          <div className={styles.actions}>
            <div className={styles.action}>
              <EuiIcon type="logstashInput" size="xl" className={styles.icon} />
              <EuiText className={styles.text}>Upload from server</EuiText>
              <EuiButtonEmpty data-testid="server-source-pipeline-dialog" onClick={onLoadPipeline} className={styles.btn}>Sync</EuiButtonEmpty>
            </div>
            <div className={styles.action}>
              <EuiIcon type="exportAction" size="xl" className={styles.icon} />
              <EuiText className={styles.text}>Upload from file</EuiText>
              <UploadModal onUploadedPipeline={onSelect}>
                <EuiButtonEmpty data-testid="file-source-pipeline-dialog" className={styles.btn}>Upload</EuiButtonEmpty>
              </UploadModal>
            </div>
            <div className={styles.action}>
              <EuiIcon type="document" size="xl" className={styles.icon} />
              <EuiText className={styles.text}>Start new pipeline</EuiText>
              <EuiButtonEmpty onClick={onStartNewPipeline} data-testid="empty-source-pipeline-dialog" className={styles.btn}>Start</EuiButtonEmpty>
            </div>
          </div>
        </section>
      </EuiModalBody>
    </EuiModal>
  )
}

export default SourcePipelineDialog
