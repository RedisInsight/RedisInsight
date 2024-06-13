import React, { useEffect } from 'react'
import {
  EuiModal,
  EuiModalBody,
  EuiTitle, EuiText, EuiButton,
} from '@elastic/eui'
import { useParams } from 'react-router-dom'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import Download from 'uiSrc/pages/rdi/pipeline-management/components/download/Download'

import styles from './styles.module.scss'

export interface Props {
  onClose: () => void
  onConfirm: () => void
}

const ConfirmLeavePagePopup = (props: Props) => {
  const { onClose, onConfirm } = props

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_UNSAVED_CHANGES_MESSAGE_DISPLAYED,
      eventData: {
        id: rdiInstanceId,
      }
    })
  }, [])

  return (
    <EuiModal className={styles.container} onClose={onClose} data-testid="oauth-select-account-dialog">
      <EuiModalBody className={styles.modalBody}>
        <section className={styles.content}>
          <EuiTitle size="s">
            <h3 className={styles.title}>Leaving pipeline?</h3>
          </EuiTitle>
          <EuiText className={styles.text}>
            There are undeployed changes that could be lost if you navigate away.
            Consider downloading the pipeline to save changes locally.
          </EuiText>
        </section>
        <div className={styles.footer}>
          <Download />
          <EuiButton
            fill
            color="secondary"
            size="s"
            className={styles.button}
            onClick={() => onConfirm()}
            data-testid="confirm-leave-page"
            aria-labelledby="confirm leave the page"
          >
            Proceed
          </EuiButton>
        </div>
      </EuiModalBody>
    </EuiModal>
  )
}

export default ConfirmLeavePagePopup
