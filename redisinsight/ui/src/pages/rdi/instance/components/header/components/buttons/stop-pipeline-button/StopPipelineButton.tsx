import React from 'react'
import { EuiButton, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'

import StopIcon from 'uiSrc/assets/img/rdi/stopFilled.svg?react'

import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'
import styles from '../styles.module.scss'

const StopPipelineButton = ({ onClick, disabled, loading }: PipelineButtonProps) => (
  <EuiToolTip
    content="Stop the pipeline to prevent processing of new data arrivals."
    anchorClassName={disabled ? styles.disabled : undefined}
  >
    <EuiButton
      aria-label="Stop running pipeline"
      type="secondary"
      size="s"
      isLoading={loading}
      isDisabled={disabled}
      className={cx(styles.pipelineBtn, { [styles.btnDisabled]: disabled })}
      iconType={StopIcon}
      data-testid="stop-pipeline-btn"
      onClick={onClick}
    >
      Stop Pipeline
    </EuiButton>
  </EuiToolTip>
)

export default StopPipelineButton
