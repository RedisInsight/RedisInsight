import React from 'react'
import { EuiButton, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'

import StartIcon from 'uiSrc/assets/img/rdi/playFilled.svg?react'

import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'
import styles from '../styles.module.scss'

const StartPipelineButton = ({ onClick, disabled, loading }: PipelineButtonProps) => (
  <EuiToolTip
    content="Start the pipeline to resume processing new data arrivals."
    anchorClassName={disabled ? styles.disabled : styles.tooltip}
  >
    <EuiButton
      aria-label="Start running pipeline"
      type="secondary"
      size="s"
      iconType={StartIcon}
      className={cx(styles.pipelineBtn, { [styles.btnDisabled]: disabled })}
      data-testid="start-pipeline-btn"
      isDisabled={disabled}
      isLoading={loading}
      onClick={onClick}
    >
      Start Pipeline
    </EuiButton>
  </EuiToolTip>
)

export default StartPipelineButton
