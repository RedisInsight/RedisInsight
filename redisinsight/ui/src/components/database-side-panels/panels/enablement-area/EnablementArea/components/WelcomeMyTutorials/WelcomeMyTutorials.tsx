import React from 'react'
import { EuiButton, EuiPanel } from '@elastic/eui'

import { useParams } from 'react-router-dom'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { ExternalLink } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  handleOpenUpload: () => void
}

const WelcomeMyTutorials = ({ handleOpenUpload }: Props) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const onClickReadMore = () => {
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_CREATE_TUTORIAL_LINK_CLICKED,
      eventData: {
        databaseId: instanceId
      }
    })
  }

  return (
    <div className={styles.wrapper} data-testid="welcome-my-tutorials">
      <EuiPanel hasBorder={false} hasShadow={false} className={styles.panel} paddingSize="s">
        <div className={styles.link}>
          <ExternalLink
            color="text"
            onClick={onClickReadMore}
            href={EXTERNAL_LINKS.guidesRepo}
            data-testid="read-more-link"
          >
            Create your own tutorial
          </ExternalLink>
        </div>
        <EuiButton
          className={styles.btnSubmit}
          color="secondary"
          size="s"
          fill
          onClick={() => handleOpenUpload()}
          data-testid="upload-tutorial-btn"
        >
          + Upload <span className={styles.hideText}>tutorial</span>
        </EuiButton>
      </EuiPanel>
    </div>
  )
}

export default WelcomeMyTutorials
