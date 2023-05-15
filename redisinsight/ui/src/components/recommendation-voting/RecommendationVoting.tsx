import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiButtonIcon,
  EuiPopover,
  EuiText,
  EuiToolTip,
  EuiFlexGroup,
} from '@elastic/eui'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { putRecommendationVote } from 'uiSrc/slices/analytics/dbAnalysis'
import { IRecommendationsStatic } from 'uiSrc/slices/interfaces/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Vote } from 'uiSrc/constants/recommendations'
import _content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { ReactComponent as LikeIcon } from 'uiSrc/assets/img/icons/like.svg'
import { ReactComponent as DislikeIcon } from 'uiSrc/assets/img/icons/dislike.svg'
import { updateLiveRecommendation } from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { Nullable } from 'uiSrc/utils'

import TooltipContent from './components/tooltip-content'
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
  const { id: instanceId = '', provider } = useSelector(connectedInstanceSelector)
  const [popover, setPopover] = useState<string>('')
  const dispatch = useDispatch()

  const onSuccessVoted = ({ vote, name }: { name: string, vote: Nullable<Vote> }) => {
    sendEventTelemetry({
      event: live
        ? TelemetryEvent.INSIGHTS_RECOMMENDATION_VOTED
        : TelemetryEvent.DATABASE_ANALYSIS_RECOMMENDATIONS_VOTED,
      eventData: {
        databaseId: instanceId,
        name: recommendationsContent[name]?.telemetryEvent ?? name,
        vote,
        provider
      }
    })
  }

  const handleClick = (name: string, vote: Vote) => {
    setPopover(vote)

    if (live) {
      dispatch(updateLiveRecommendation(id, { vote }, onSuccessVoted))
    } else {
      dispatch(putRecommendationVote(name, vote, onSuccessVoted))
    }
  }

  const handleClosePopover = () => setPopover('')

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
      <EuiText size="m">Was this useful?</EuiText>
      <div className="voteContent">
        <EuiToolTip
          content={getTooltipContent('Useful')}
          position="bottom"
          data-testid="useful-vote-tooltip"
        >
          <EuiPopover
            initialFocus={false}
            anchorPosition="rightCenter"
            isOpen={popover === Vote.Like}
            closePopover={handleClosePopover}
            anchorClassName={styles.popoverAnchor}
            panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
            button={(
              <EuiButtonIcon
                disabled={!config?.agreements?.analytics}
                iconType={LikeIcon}
                className={cx('vote__btn', { selected: vote === Vote.Like })}
                aria-label="vote useful"
                data-testid="useful-vote-btn"
                onClick={() => handleClick(name, Vote.Like)}
              />
            )}
          >
            <TooltipContent vote={Vote.Like} handleClosePopover={handleClosePopover} />
          </EuiPopover>
        </EuiToolTip>
        <EuiToolTip
          content={getTooltipContent('Not Useful')}
          position="bottom"
          data-testid="not-useful-vote-tooltip"
        >
          <EuiPopover
            initialFocus={false}
            anchorPosition="rightCenter"
            isOpen={popover === Vote.Dislike}
            closePopover={handleClosePopover}
            anchorClassName={styles.popoverAnchor}
            panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
            button={(
              <EuiButtonIcon
                disabled={!config?.agreements?.analytics}
                iconType={DislikeIcon}
                className={cx('vote__btn', { selected: vote === Vote.Dislike })}
                aria-label="vote not useful"
                data-testid="not-useful-vote-btn"
                onClick={() => handleClick(name, Vote.Dislike)}
              />
            )}
          >
            <TooltipContent vote={Vote.Dislike} handleClosePopover={handleClosePopover} />
          </EuiPopover>
        </EuiToolTip>
      </div>
    </EuiFlexGroup>
  )
}

export default RecommendationVoting
