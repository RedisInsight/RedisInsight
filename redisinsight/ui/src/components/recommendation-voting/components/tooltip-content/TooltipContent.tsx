import React from 'react'
import {
  EuiButton,
  EuiButtonIcon,
  EuiText,
  EuiIcon,
  EuiLink,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { Vote } from 'uiSrc/constants/recommendations'
import PetardIcon from 'uiSrc/assets/img/icons/petard.svg'
import GithubSVG from 'uiSrc/assets/img/icons/github-white.svg'

import { getTooltipContent } from './utils'
import styles from './styles.module.scss'

export interface Props {
  vote: Vote
  handleClosePopover: () => void
}

const TooltipContent = ({ vote, handleClosePopover }: Props) => (
  <div className={styles.wrapper}>
    <EuiFlexGroup gutterSize="none" direction="column" alignItems="flexEnd">
      <EuiFlexItem grow={false}>
        <EuiFlexGroup gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiIcon type={PetardIcon} className={styles.petardIcon} />
          </EuiFlexItem>
          <EuiFlexItem>
            <div>
              <EuiText className={styles.text} data-testid="common-text">Thank you for the feedback.</EuiText>
              <EuiText className={styles.text} data-testid="custom-text">{getTooltipContent(vote)}</EuiText>
            </div>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="cross"
              color="primary"
              id="close-voting-popover"
              aria-label="close popover"
              data-testid="close-popover"
              className={styles.closeBtn}
              onClick={handleClosePopover}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
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
      </EuiFlexItem>
    </EuiFlexGroup>
  </div>
)

export default TooltipContent
