import React from 'react'
import { EuiToolTip } from '@elastic/eui'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiStopIcon } from 'uiSrc/components/base/icons'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'
import styles from '../styles.module.scss'

const StopPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => (
  <EuiToolTip
    content="Stop the pipeline to prevent processing of new data arrivals."
    anchorClassName={disabled ? styles.disabled : undefined}
  >
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
  </EuiToolTip>
)

export default StopPipelineButton
