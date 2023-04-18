import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiButton,
  EuiButtonIcon,
  EuiPopover,
  EuiText,
  EuiToolTip,
  EuiFlexGroup,
  EuiIcon,
  EuiLink,
} from '@elastic/eui'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { putRecommendationVote } from 'uiSrc/slices/analytics/dbAnalysis'
import { IRecommendationsStatic } from 'uiSrc/slices/interfaces/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { Vote } from 'uiSrc/constants/recommendations'
import _content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { ReactComponent as LikeIcon } from 'uiSrc/assets/img/icons/like.svg'
import { ReactComponent as DoubleLikeIcon } from 'uiSrc/assets/img/icons/double_like.svg'
import { ReactComponent as DislikeIcon } from 'uiSrc/assets/img/icons/dislike.svg'
import GithubSVG from 'uiSrc/assets/img/sidebar/github.svg'
import { updateLiveRecommendation } from 'uiSrc/slices/recommendations/recommendations'
import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  vote?: Nullable<Vote>
  name: string
  id?: string
  live?: boolean
  containerClass?: string
}

const recommendationsContent = _content as IRecommendationsStatic

const RecommendationVoting = ({ vote, name, id = '', live = false, containerClass = '' }: Props) => {
  const config = useSelector(userSettingsConfigSelector)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const dispatch = useDispatch()

  const onSuccessVoted = (instanceId: string, { vote, name }: { name: string, vote: Nullable<Vote> }) => {
    sendEventTelemetry({
      event: live
        ? TelemetryEvent.INSIGHTS_RECOMMENDATION_VOTED
        : TelemetryEvent.DATABASE_ANALYSIS_RECOMMENDATIONS_VOTED,
      eventData: {
        databaseId: instanceId,
        name: recommendationsContent[name]?.telemetryEvent ?? name,
        vote,
      }
    })
  }

  const handleClick = (name: string, vote: Vote) => {
    if (vote === Vote.Dislike) {
      setIsPopoverOpen(true)
    }

    if (live) {
      dispatch(updateLiveRecommendation(id, { vote },
        (instanceId, { vote }) =>
          onSuccessVoted(instanceId, { vote, name: recommendationsContent[name]?.telemetryEvent ?? name })))
    } else {
      dispatch(putRecommendationVote(name, vote, onSuccessVoted))
    }
  }

  const getTooltipContent = (recommendationsContent: string) => (config?.agreements?.analytics
    ? recommendationsContent
    : 'Enable Analytics on the Settings page to vote for a recommendation')

  return (
    <EuiFlexGroup
      alignItems="center"
      className={cx(styles.votingContainer, containerClass)}
      gutterSize={live ? 'none' : 'l'}
      data-testid="recommendation-voting"
    >
      <EuiText size="m">Rate Recommendation</EuiText>
      <div className="voteContent">
        <EuiToolTip
          content={getTooltipContent('Very Useful')}
          position="bottom"
          data-testid="very-useful-vote-tooltip"
        >
          <EuiButtonIcon
            disabled={!!vote || !config?.agreements?.analytics}
            iconType={DoubleLikeIcon}
            className={cx('vote__btn', { selected: vote === Vote.DoubleLike })}
            aria-label="vote very useful"
            data-testid="very-useful-vote-btn"
            onClick={() => handleClick(name, Vote.DoubleLike)}
          />
        </EuiToolTip>
        <EuiToolTip
          content={getTooltipContent('Useful')}
          position="bottom"
          data-testid="useful-vote-tooltip"
        >
          <EuiButtonIcon
            disabled={!!vote || !config?.agreements?.analytics}
            iconType={LikeIcon}
            className={cx('vote__btn', { selected: vote === Vote.Like })}
            aria-label="vote useful"
            data-testid="useful-vote-btn"
            onClick={() => handleClick(name, Vote.Like)}
          />
        </EuiToolTip>
        <EuiToolTip
          content={getTooltipContent('Not Useful')}
          position="bottom"
          data-testid="not-useful-vote-tooltip"
        >
          <EuiPopover
            initialFocus={false}
            anchorPosition="rightCenter"
            isOpen={isPopoverOpen}
            closePopover={() => setIsPopoverOpen(false)}
            anchorClassName={styles.popoverAnchor}
            panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
            button={(
              <EuiButtonIcon
                disabled={!!vote || !config?.agreements?.analytics}
                iconType={DislikeIcon}
                className={cx('vote__btn', { selected: vote === Vote.Dislike })}
                aria-label="vote not useful"
                data-testid="not-useful-vote-btn"
                onClick={() => handleClick(name, Vote.Dislike)}
              />
            )}
          >
            <div>
              Thank you for your feedback, Tell us how we can improve
              <EuiButton
                aria-label="recommendation feedback"
                fill
                data-testid="recommendation-feedback-btn"
                className={styles.feedbackBtn}
                color="secondary"
                size="s"
              >
                <EuiLink
                  external={false}
                  className={styles.link}
                  href={EXTERNAL_LINKS.recommendationFeedback}
                  target="_blank"
                  data-test-subj="github-repo-link"
                >
                  <EuiIcon
                    className={styles.githubIcon}
                    aria-label="redis insight github issues"
                    type={GithubSVG}
                    data-testid="github-repo-icon"
                  />
                  To Github
                </EuiLink>
              </EuiButton>
              <EuiButtonIcon
                iconType="cross"
                color="primary"
                id="close-monitor"
                aria-label="close popover"
                data-testid="close-popover"
                className={styles.icon}
                onClick={() => setIsPopoverOpen(false)}
              />
            </div>
          </EuiPopover>
        </EuiToolTip>
      </div>
    </EuiFlexGroup>
  )
}

export default RecommendationVoting
