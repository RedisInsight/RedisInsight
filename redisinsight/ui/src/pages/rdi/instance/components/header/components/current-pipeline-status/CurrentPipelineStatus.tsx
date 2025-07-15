import React from 'react'
import { PipelineState } from 'uiSrc/slices/interfaces'
import { formatLongName, Maybe } from 'uiSrc/utils'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { IconProps } from 'uiSrc/components/base/icons'
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
  ): {
    label: string
    icon: AllIconsType
    iconColor: IconProps['color']
  } => {
    switch (pipelineState) {
      case PipelineState.InitialSync:
        return {
          icon: 'IndicatorSyncingIcon',
          iconColor: 'success300',
          label: 'Initial sync',
        }
      case PipelineState.CDC:
        return {
          icon: 'IndicatorSyncedIcon',
          iconColor: 'success300',
          label: 'Streaming',
        }
      case PipelineState.NotRunning:
        return {
          icon: 'IndicatorXIcon',
          iconColor: 'attention500',
          label: 'Not running',
        }
      default:
        return {
          icon: 'IndicatorErrorIcon',
          iconColor: 'danger500',
          label: 'Error',
        }
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
        <RiTooltip
          content={errorTooltipContent}
          anchorClassName={statusError && styles.tooltip}
        >
          <div className={styles.stateBadge} data-testid="pipeline-state-badge">
            <RiIcon type={stateInfo.icon} color={stateInfo.iconColor} />
            <span>{stateInfo.label}</span>
          </div>
        </RiTooltip>
      )}
    </div>
  )
}

export default CurrentPipelineStatus
