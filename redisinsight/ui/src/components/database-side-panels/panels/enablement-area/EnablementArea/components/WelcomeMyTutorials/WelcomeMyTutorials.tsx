import React from 'react'
import { EuiButton, EuiIcon, EuiLink, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'

import { useParams } from 'react-router-dom'
import UploadYourTutorialsImage from 'uiSrc/assets/img/workbench/my-tutorials.svg'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import styles from './styles.module.scss'

export interface Props {
  handleOpenUpload: () => void
}

const WelcomeMyTutorials = ({ handleOpenUpload }: Props) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const onClickReadMore = () => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_TUTORIAL_INFO_CLICKED,
      eventData: {
        databaseId: instanceId
      }
    })
  }

  return (
    <div className={styles.wrapper} data-testid="welcome-my-tutorials">
      <EuiTitle size="s"><div style={{ fontSize: 22, fontWeight: 400 }}>Welcome to</div></EuiTitle>
      <EuiTitle><div style={{ marginTop: 4 }}>My Tutorials</div></EuiTitle>
      <EuiSpacer size="m" />

      <img src={UploadYourTutorialsImage} alt="upload tutorial img" loading="lazy" />

      <EuiSpacer size="s" />
      <EuiText style={{ fontSize: 16 }}>Here you can <br /> upload your own tutorials</EuiText>
      <EuiSpacer size="s" />

      <EuiButton
        className={styles.btnSubmit}
        color="secondary"
        size="m"
        fill
        onClick={() => handleOpenUpload()}
        data-testid="upload-tutorial-btn"
      >
        Upload tutorial
      </EuiButton>

      <div className={styles.hr}>OR</div>

      <EuiText size="xs">Want to learn how to create your own tutorials?</EuiText>
      <EuiSpacer size="s" />

      <EuiLink
        color="text"
        className={styles.link}
        external={false}
        target="_blank"
        onClick={onClickReadMore}
        href={EXTERNAL_LINKS.guidesRepo}
        data-testid="read-more-link"
      >
        <EuiIcon type="sortUp" className={styles.linkIcon} />
        Read More
      </EuiLink>
    </div>
  )
}

export default WelcomeMyTutorials
