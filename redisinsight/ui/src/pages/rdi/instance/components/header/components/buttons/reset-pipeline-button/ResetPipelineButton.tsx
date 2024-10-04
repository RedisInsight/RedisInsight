import React from 'react'
import { EuiButton, EuiSpacer, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import ResetIcon from 'uiSrc/assets/img/rdi/reset.svg?react'
import styles from '../styles.module.scss'

export interface PipelineButtonProps {
  onClick: () => void
  disabled: boolean
  loading: boolean
}

const ResetPipelineButton = ({ onClick, disabled, loading }: PipelineButtonProps) => (
  <EuiToolTip
    content={!(disabled || loading) ? (
      <>
        <p>The pipeline will take a new snapshot of the data and process it, then continue tracking changes.</p>
        <EuiSpacer size="m" />
        <p>
          Before resetting the RDI pipeline, consider stopping the pipeline and flushing the target Redis database.
        </p>
      </>
    ) : null}
    anchorClassName={(disabled || loading) ? styles.disabled : styles.tooltip}
  >
    <EuiButton
      aria-label="Reset pipeline button"
      type="secondary"
      size="s"
      iconType={ResetIcon}
      className={cx(styles.pipelineBtn, { [styles.btnDisabled]: disabled })}
      data-testid="reset-pipeline-btn"
      onClick={onClick}
      isDisabled={disabled}
      isLoading={loading}
    >
      Reset Pipeline
    </EuiButton>
  </EuiToolTip>
)

export default ResetPipelineButton
