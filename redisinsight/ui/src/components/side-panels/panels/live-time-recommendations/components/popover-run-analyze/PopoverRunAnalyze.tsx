import { EuiButton, EuiPopover, EuiSpacer, EuiText } from '@elastic/eui'
import React from 'react'

import styles from './styles.module.scss'

export interface Props {
  popoverContent: string
  isShowPopover: boolean
  children: React.ReactElement
  onApproveClick: () => void
  setIsShowPopover: (value: boolean) => void
}

const PopoverRunAnalyze = (props: Props) => {
  const { isShowPopover, popoverContent, setIsShowPopover, onApproveClick, children } = props

  return (
    <EuiPopover
      ownFocus
      anchorPosition="upCenter"
      isOpen={isShowPopover}
      closePopover={() => setIsShowPopover(false)}
      panelPaddingSize="m"
      display="inlineBlock"
      panelClassName={styles.panelPopover}
      button={children}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.popover} data-testid="insights-db-analysis-popover">
        <EuiText className={styles.popoverTitle}>Run database analysis</EuiText>
        <EuiSpacer size="xs" />
        <EuiText className={styles.popoverContent} color="subdued">
          {popoverContent}
        </EuiText>
        <EuiSpacer size="m" />
        <EuiButton
          aria-label="Analyze"
          fill
          data-testid="approve-insights-db-analysis-btn"
          color="secondary"
          iconSide="left"
          onClick={onApproveClick}
          size="s"
          className={styles.popoverApproveBtn}
        >
          Analyze
        </EuiButton>
      </div>
    </EuiPopover>
  )
}

export default PopoverRunAnalyze
