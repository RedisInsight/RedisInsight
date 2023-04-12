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

import { Nullable, findMarkdownPathByPath, Maybe } from 'uiSrc/utils'
import { EAManifestFirstKey, Pages, Theme } from 'uiSrc/constants'
import { getRouterLinkProps } from 'uiSrc/services'
import { RecommendationVoting } from 'uiSrc/components'
import { Vote } from 'uiSrc/constants/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { setIsContentVisible } from 'uiSrc/slices/recommendations/recommendations'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { IRecommendationContent, IRecommendationsStatic } from 'uiSrc/slices/interfaces/recommendations'

import _content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { ReactComponent as Icon } from 'uiSrc/assets/img/icons/recommendation.svg'
import RediStackDarkMin from 'uiSrc/assets/img/modules/redistack/RediStackDark-min.svg'
import RediStackLightMin from 'uiSrc/assets/img/modules/redistack/RediStackLight-min.svg'

import styles from './styles.module.scss'

export interface IProps {
  id: string
  name: string
  instanceId: string
  tutorial: string
  isRead: boolean
  vote: Nullable<Vote>
  guides: IEnablementAreaItem[]
  tutorials: IEnablementAreaItem[]
}

const recommendationsContent = _content as IRecommendationsStatic

const Recommendation = ({
  id,
  name,
  instanceId,
  isRead,
  vote,
  tutorial,
  guides,
  tutorials,
}: IProps) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { theme } = useContext(ThemeContext)

  const { redisStack, title, liveTitle } = recommendationsContent[name] || {}
  const recommendationTitle = liveTitle || title

  const handleClose = () => dispatch(setIsContentVisible(false))

  const handleClick = () => {
    dispatch(setIsContentVisible(false))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATIONS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: instanceId,
        name: recommendationsContent[name].telemetryEvent || name,
      }
    })

    if (tutorial) {
      const quickGuidesPath = findMarkdownPathByPath(guides, tutorial)
      if (quickGuidesPath) {
        history.push(`${Pages.workbench(instanceId)}?path=${EAManifestFirstKey.GUIDES}/${quickGuidesPath}`)
        return
      }

      const tutorialsPath = findMarkdownPathByPath(tutorials, tutorial)
      if (tutorialsPath) {
        history.push(`${Pages.workbench(instanceId)}?path=${EAManifestFirstKey.TUTORIALS}/${tutorialsPath}`)
        return
      }
    }

    history.push(Pages.workbench(instanceId))
  }

  const renderContentElement = ({ id, type, value }: IRecommendationContent) => {
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
      {recommendationsContent[name]?.liveTimeText?.map((item) => renderContentElement(item))}
      <div className={styles.actions}>
        <RecommendationVoting live id={id} vote={vote} name={name} />
        {tutorial && (
          <EuiButton
            className={styles.btn}
            onClick={handleClick}
            fill
            color="secondary"
            data-testid={`${name}-to-tutorial-btn`}
          >
            To Tutorial
          </EuiButton>
        )}
      </div>
    </EuiText>
  )

  const renderButtonContent = (redisStack: Maybe<boolean>, title: string, id: string) => (
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

  if (!(name in recommendationsContent)) {
    return null
  }

  return (
    <div
      className={cx(styles.recommendationAccordion, { [styles.read]: isRead })}
      data-testid={`${name}-recommendation`}
    >
      <EuiAccordion
        id={name}
        initialIsOpen={!isRead}
        arrowDisplay="right"
        buttonContent={renderButtonContent(redisStack, recommendationTitle, name)}
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
