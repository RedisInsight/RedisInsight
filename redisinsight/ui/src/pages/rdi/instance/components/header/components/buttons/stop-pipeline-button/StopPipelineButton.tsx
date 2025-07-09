import React from 'react'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiStopIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'

const StopPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => (
  <RiTooltip content="Stop the pipeline to prevent processing of new data arrivals.">
    <SecondaryButton
      aria-label="Stop running pipeline"
      size="s"
      loading={loading}
      disabled={disabled}
      icon={RiStopIcon}
      data-testid="stop-pipeline-btn"
      onClick={onClick}
    >
      Stop Pipeline
    </SecondaryButton>
  </RiTooltip>
)

export default StopPipelineButton
