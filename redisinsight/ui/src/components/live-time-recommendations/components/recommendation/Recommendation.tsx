import React, { useContext } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  EuiButton,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
  EuiPanel,
  EuiAccordion,
  EuiToolTip,
  EuiIcon
} from '@elastic/eui'
import { SpacerSize } from '@elastic/eui/src/components/spacer/spacer'
import cx from 'classnames'

import { Nullable } from 'uiSrc/utils'
import { Pages, Theme } from 'uiSrc/constants'
import { getRouterLinkProps } from 'uiSrc/services'
import { RecommendationVoting } from 'uiSrc/components'
import { Vote } from 'uiSrc/constants/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { setIsContentVisible } from 'uiSrc/slices/recommendations/recommendations'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { ReactComponent as Icon } from 'uiSrc/assets/img/icons/recommendation.svg'
import RediStackDarkMin from 'uiSrc/assets/img/modules/redistack/RediStackDark-min.svg'
import RediStackLightMin from 'uiSrc/assets/img/modules/redistack/RediStackLight-min.svg'

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
  const { theme } = useContext(ThemeContext)

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

  const recommendationContent = () => (
    <EuiText className={styles.floatContent}>
      <div className={styles.icon}>
        <Icon />
      </div>
      {content[name]?.liveTimeText?.map((item) => renderContentElement(item))}
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
    </EuiText>
  )

  const renderButtonContent = (redisStack: boolean, title: string, id: string) => (
    <EuiFlexGroup
      className={styles.accordionButton}
      responsive={false}
      alignItems="center"
      justifyContent="spaceBetween"
      gutterSize="none"
    >
      <EuiFlexGroup alignItems="center" gutterSize="none">
        <EuiFlexItem grow={false}>
          {redisStack && (
            <EuiLink
              external={false}
              target="_blank"
              href={EXTERNAL_LINKS.redisStack}
              className={styles.redisStackLink}
              data-testid={`${id}-redis-stack-link`}
            >
              <EuiToolTip
                content="Redis Stack"
                position="top"
                display="inlineBlock"
                anchorClassName="flex-row"
              >
                <EuiIcon
                  type={theme === Theme.Dark ? RediStackDarkMin : RediStackLightMin}
                  className={styles.redisStackIcon}
                  data-testid={`${id}-redis-stack-icon`}
                />
              </EuiToolTip>
            </EuiLink>
          )}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          {title}
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexGroup>
  )

  if (!(name in content)) {
    return null
  }

  const { redisStack, title } = content[name]

  return (
    <div className={cx(styles.recommendationAccordion, { [styles.read]: isRead })}>
      <EuiAccordion
        id={name}
        initialIsOpen={!isRead}
        arrowDisplay="right"
        buttonContent={renderButtonContent(redisStack, title, name)}
        buttonClassName={styles.accordionBtn}
        buttonProps={{ 'data-test-subj': `${name}-button` }}
        className={styles.accordion}
        data-testid={`${name}-accordion`}
      >
        <EuiPanel className={styles.accordionContent} color="subdued">
          {recommendationContent()}
        </EuiPanel>
      </EuiAccordion>
    </div>
  )
}

export default Recommendation
