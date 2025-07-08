import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiIcon } from '@elastic/eui'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { Vote } from 'uiSrc/constants/recommendations'
import { putRecommendationVote } from 'uiSrc/slices/analytics/dbAnalysis'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  recommendationsSelector,
  updateLiveRecommendation,
} from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { Nullable } from 'uiSrc/utils'
import PetardIcon from 'uiSrc/assets/img/icons/petard.svg?react'
import GithubSVG from 'uiSrc/assets/img/icons/github-white.svg?react'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { IconButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { getVotedText, voteTooltip, iconType } from './utils'
import styles from './styles.module.scss'

export interface Props {
  voteOption: Vote
  vote?: Nullable<Vote>
  popover: string
  isAnalyticsEnable?: boolean
  setPopover: (popover: string) => void
  live?: boolean
  id: string
  name: string
}

const VoteOption = (props: Props) => {
  const {
    voteOption,
    vote,
    popover,
    isAnalyticsEnable,
    setPopover,
    live,
    id,
    name,
  } = props

  const dispatch = useDispatch()
  const { id: instanceId = '', provider } = useSelector(
    connectedInstanceSelector,
  )
  const { content: recommendationsContent } = useSelector(
    recommendationsSelector,
  )

  const onSuccessVoted = ({
    vote,
    name,
  }: {
    name: string
    vote: Nullable<Vote>
  }) => {
    sendEventTelemetry({
      event: live
        ? TelemetryEvent.INSIGHTS_TIPS_VOTED
        : TelemetryEvent.DATABASE_ANALYSIS_TIPS_VOTED,
      eventData: {
        databaseId: instanceId,
        name: recommendationsContent[name]?.telemetryEvent ?? name,
        vote,
        provider,
      },
    })
  }

  const handleClick = (name: string) => {
    setPopover(voteOption)

    if (live) {
      dispatch(
        updateLiveRecommendation(id, { vote: voteOption }, onSuccessVoted),
      )
    } else {
      dispatch(putRecommendationVote(name, voteOption, onSuccessVoted))
    }
  }

  const getTooltipContent = (voteOption: Vote) =>
    isAnalyticsEnable
      ? voteTooltip[voteOption]
      : 'Enable Analytics on the Settings page to vote for a tip'

  return (
    <RiPopover
      anchorPosition="rightCenter"
      isOpen={popover === voteOption}
      closePopover={() => setPopover('')}
      anchorClassName={styles.popoverAnchor}
      panelClassName={cx('popoverLikeTooltip', styles.popover)}
      button={
        <RiTooltip
          content={getTooltipContent(voteOption)}
          position="bottom"
          data-testid={`${voteOption}-vote-tooltip`}
        >
          <IconButton
            disabled={!isAnalyticsEnable}
            icon={iconType[voteOption] ?? 'default'}
            className={cx('vote__btn', { selected: vote === voteOption })}
            aria-label="vote useful"
            data-testid={`${voteOption}-vote-btn`}
            onClick={() => handleClick(name)}
          />
        </RiTooltip>
      }
    >
      <div
        className={styles.popoverWrapper}
        data-testid={`${name}-${voteOption}-popover`}
      >
        <Col align="end">
          <FlexItem>
            <Row>
              <FlexItem>
                <EuiIcon type={PetardIcon} className={styles.petardIcon} />
              </FlexItem>
              <FlexItem grow>
                <div>
                  <Text className={styles.text} data-testid="common-text">
                    Thank you for the feedback.
                  </Text>
                  <Text className={styles.text} data-testid="custom-text">
                    {getVotedText(voteOption)}
                  </Text>
                </div>
              </FlexItem>
              <FlexItem>
                <IconButton
                  icon={CancelSlimIcon}
                  id="close-voting-popover"
                  aria-label="close popover"
                  data-testid="close-popover"
                  className={styles.closeBtn}
                  onClick={() => setPopover('')}
                />
              </FlexItem>
            </Row>
          </FlexItem>
          <FlexItem grow>
            <PrimaryButton
              aria-label="recommendation feedback"
              data-testid="recommendation-feedback-btn"
              className={styles.feedbackBtn}
              size="s"
            >
              <Link
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
              </Link>
            </PrimaryButton>
          </FlexItem>
        </Col>
      </div>
    </RiPopover>
  )
}

export default VoteOption
