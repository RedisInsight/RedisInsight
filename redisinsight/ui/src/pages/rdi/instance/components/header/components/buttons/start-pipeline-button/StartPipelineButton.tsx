import React from 'react'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { PlayFilledIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'

const StartPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => (
  <RiTooltip content="Start the pipeline to resume processing new data arrivals.">
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
  </RiTooltip>
)

export default StartPipelineButton
