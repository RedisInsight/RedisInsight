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
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { Vote } from 'uiSrc/constants/recommendations'

import { ReactComponent as LikeIcon } from 'uiSrc/assets/img/icons/like.svg'
import { ReactComponent as DoubleLikeIcon } from 'uiSrc/assets/img/icons/double_like.svg'
import { ReactComponent as DislikeIcon } from 'uiSrc/assets/img/icons/dislike.svg'
import GithubSVG from 'uiSrc/assets/img/sidebar/github.svg'
import styles from './styles.module.scss'

export interface Props { vote?: Vote, name: string }

const RecommendationVoting = ({ vote, name }: Props) => {
  const config = useSelector(userSettingsConfigSelector)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const dispatch = useDispatch()

  const onSuccessVoted = (instanceId: string, name: string, vote: Vote) => {
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_ANALYSIS_RECOMMENDATIONS_VOTED,
      eventData: {
        databaseId: instanceId,
        name,
        vote,
      }
    })
  }

  const handleClick = (name: string, vote: Vote) => {
    if (vote === Vote.Dislike) {
      setIsPopoverOpen(true)
    }
    dispatch(putRecommendationVote(name, vote, onSuccessVoted))
  }

  const getTooltipContent = (content: string) => (config?.agreements?.analytics
    ? content
    : 'Enable Analytics on the Settings page to vote for a recommendation')

  return (
    <EuiFlexGroup alignItems="center" className={styles.votingContainer}>
      <EuiText size="m">Rate Recommendation</EuiText>
      <div className={styles.vote}>
        <EuiToolTip
          content={getTooltipContent('Very Useful')}
          position="bottom"
          data-testid="very-useful-vote-tooltip"
        >
          <EuiButtonIcon
            disabled={!!vote || !config?.agreements?.analytics}
            iconType={DoubleLikeIcon}
            className={cx(styles.voteBtn, { [styles.selected]: vote === Vote.DoubleLike })}
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
            className={cx(styles.voteBtn, { [styles.selected]: vote === Vote.Like })}
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
                className={cx(styles.voteBtn, { [styles.selected]: vote === Vote.Dislike })}
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
