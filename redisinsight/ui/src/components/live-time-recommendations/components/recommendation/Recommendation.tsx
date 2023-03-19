import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { EuiButton, EuiText, EuiFlexGroup, EuiFlexItem } from '@elastic/eui'

import { Pages } from 'uiSrc/constants'
import content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { setIsContentVisible } from 'uiSrc/slices/recommendations/recommendations'
import { ReactComponent as Icon } from 'uiSrc/assets/img/icons/recommendation.svg'

import styles from './styles.module.scss'

export interface IProps {
  name: string
  instanceId: string
}

const Recommendation = ({ name, instanceId }: IProps) => {
  const history = useHistory()
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(setIsContentVisible(false))
    history.push(Pages.workbench(instanceId))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATIONS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: instanceId,
        name,
      }
    })
  }

  return (
    <div className={styles.wrapper} data-testid={`${name}-recommendation`}>
      <EuiFlexGroup responsive={false} gutterSize="none">
        <EuiFlexItem grow={false}>
          <Icon className={styles.icon} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText className={styles.text}>{content[name]?.liveTimeText}</EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <div className={styles.actions}>
        <EuiButton
          className={styles.btn}
          onClick={handleClick}
          fill
          data-testid={`${name}-to-tutorial-btn`}
        >
          To Tutorial
        </EuiButton>
      </div>
    </div>
  )
}

export default Recommendation
