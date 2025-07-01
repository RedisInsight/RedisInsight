import React from 'react'
import { EuiIcon } from '@elastic/eui'
import initialSyncIcon from 'uiSrc/assets/img/rdi/pipelineStatuses/initial_sync.svg?react'
import streamingIcon from 'uiSrc/assets/img/rdi/pipelineStatuses/streaming.svg?react'
import notRunningIcon from 'uiSrc/assets/img/rdi/pipelineStatuses/not_running.svg?react'
import statusErrorIcon from 'uiSrc/assets/img/rdi/pipelineStatuses/status_error.svg?react'
import { PipelineState } from 'uiSrc/slices/interfaces'
import { Maybe, formatLongName } from 'uiSrc/utils'
import { Title } from 'uiSrc/components/base/text/Title'
import { Loader } from 'uiSrc/components/base/display'
import { RiTooltip } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  pipelineState?: PipelineState
  statusError?: string
  headerLoading: boolean
}

const CurrentPipelineStatus = ({
  pipelineState,
  statusError,
  headerLoading,
}: Props) => {
  const getPipelineStateIconAndLabel = (
    pipelineState: Maybe<PipelineState>,
  ) => {
    switch (pipelineState) {
      case PipelineState.InitialSync:
        return { icon: initialSyncIcon, label: 'Initial sync' }
      case PipelineState.CDC:
        return { icon: streamingIcon, label: 'Streaming' }
      case PipelineState.NotRunning:
        return { icon: notRunningIcon, label: 'Not running' }
      default:
        return { icon: statusErrorIcon, label: 'Error' }
    }
  }
  const stateInfo = getPipelineStateIconAndLabel(pipelineState)
  const errorTooltipContent = statusError && formatLongName(statusError)

  return (
    <div className={styles.stateWrapper}>
      <Title size="XS">Pipeline State:</Title>
      {headerLoading ? (
        <Loader size="m" style={{ marginLeft: '8px' }} />
      ) : (
        <RiTooltip content={errorTooltipContent}>
          <div className={styles.stateBadge} data-testid="pipeline-state-badge">
            <EuiIcon type={stateInfo.icon} />
            <span>{stateInfo.label}</span>
          </div>
        </RiTooltip>
      )}
    </div>
  )
}

export default CurrentPipelineStatus
