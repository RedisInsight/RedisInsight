import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { EuiButton, EuiText, EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer } from '@elastic/eui'
import { SpacerSize } from '@elastic/eui/src/components/spacer/spacer'
import cx from 'classnames'

import { Pages } from 'uiSrc/constants'
import content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { getRouterLinkProps } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { setIsContentVisible } from 'uiSrc/slices/recommendations/recommendations'
import { ReactComponent as Icon } from 'uiSrc/assets/img/icons/recommendation.svg'
import { RecommendationVoting } from 'uiSrc/components'
import { Vote } from 'uiSrc/constants/recommendations'
import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface IProps {
  id: string
  name: string
  instanceId: string
  isRead: boolean
  vote: Nullable<Vote>
}

const Recommendation = ({ id, name, instanceId, isRead, vote }: IProps) => {
  const history = useHistory()
  const dispatch = useDispatch()

  const handleClose = () => dispatch(setIsContentVisible(false))

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

  const renderContentElement = ({ id, type, value }) => {
    switch (type) {
      case 'paragraph':
        return <EuiText key={id} className={styles.text}>{value}</EuiText>
      case 'span':
        return <EuiText key={id} className={cx(styles.text, styles.span)}>{value}</EuiText>
      case 'link':
        return <EuiLink key={id} external={false} data-testid={`link-${id}`} target="_blank" href={value.href}>{value.name}</EuiLink>
      case 'spacer':
        return <EuiSpacer key={id} size={value as SpacerSize} />
      case 'workbenchLink':
        return (
          <EuiLink
            key={id}
            className={styles.link}
            {...getRouterLinkProps(Pages.workbench(instanceId), handleClose)}
            data-test-subj={`workbench-link-${id}`}
          >
            {value}
          </EuiLink>
        )
      default:
        return value
    }
  }

  return (
    <div className={cx(styles.wrapper, { [styles.read]: isRead })} data-testid={`${name}-recommendation`} key={name}>
      <EuiFlexGroup responsive={false} gutterSize="none">
        <EuiFlexItem grow={false}>
          <Icon className={styles.icon} />
        </EuiFlexItem>
        <EuiFlexItem>
          <div className={styles.content}>
            {content[name]?.liveTimeText?.map((item) => renderContentElement(item))}
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
      <div className={styles.actions}>
        <RecommendationVoting live id={id} vote={vote} name={name} />
        <EuiButton
          className={styles.btn}
          onClick={handleClick}
          fill
          color="secondary"
          data-testid={`${name}-to-tutorial-btn`}
        >
          To Tutorial
        </EuiButton>
      </div>
    </div>
  )
}

export default Recommendation
