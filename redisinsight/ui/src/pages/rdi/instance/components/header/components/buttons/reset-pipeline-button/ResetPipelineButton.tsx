import React from 'react'

import { RiResetIcon } from 'uiSrc/components/base/icons'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiTooltip } from 'uiSrc/components'

export interface PipelineButtonProps {
  onClick: () => void
  disabled: boolean
  loading: boolean
}

const ResetPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => (
  <RiTooltip
    content={
      !(disabled || loading) ? (
        <>
          <p>
            The pipeline will take a new snapshot of the data and process it,
            then continue tracking changes.
          </p>
          <Spacer size="m" />
          <p>
            Before resetting the RDI pipeline, consider stopping the pipeline
            and flushing the target Redis database.
          </p>
        </>
      ) : null
    }
  >
    <SecondaryButton
      aria-label="Reset pipeline button"
      size="s"
      icon={RiResetIcon}
      data-testid="reset-pipeline-btn"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
    >
      Reset Pipeline
    </SecondaryButton>
  </RiTooltip>
)

export default ResetPipelineButton
