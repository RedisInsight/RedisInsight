import React from 'react'
import { EuiToolTip } from '@elastic/eui'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { PlayFilledIcon } from 'uiSrc/components/base/icons'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'
import styles from '../styles.module.scss'

const StartPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => (
  <EuiToolTip
    content="Start the pipeline to resume processing new data arrivals."
    anchorClassName={disabled ? styles.disabled : styles.tooltip}
  >
    <SecondaryButton
      aria-label="Start running pipeline"
      size="s"
      icon={PlayFilledIcon}
      data-testid="start-pipeline-btn"
      disabled={disabled}
      loading={loading}
      onClick={onClick}
    >
      Start Pipeline
    </SecondaryButton>
  </EuiToolTip>
)

export default StartPipelineButton
