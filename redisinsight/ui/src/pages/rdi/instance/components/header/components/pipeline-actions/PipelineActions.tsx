import React from 'react'
import {
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  getPipelineStatusAction,
  rdiPipelineActionSelector,
  rdiPipelineSelector,
  resetPipelineAction,
  startPipelineAction,
  stopPipelineAction
} from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { CollectorStatus, IActionPipelineResultProps, PipelineAction, PipelineStatus } from 'uiSrc/slices/interfaces'
import DeployPipelineButton from '../buttons/deploy-pipeline-button'
import ResetPipelineButton from '../buttons/reset-pipeline-button'
import RdiConfigFileActionMenu from '../rdi-config-file-action-menu'
import StopPipelineButton from '../buttons/stop-pipeline-button'
import StartPipelineButton from '../buttons/start-pipeline-button/StartPipelineButton'

export interface Props {
  collectorStatus?: CollectorStatus
  pipelineStatus?: PipelineStatus
}

const PipelineActions = ({ collectorStatus, pipelineStatus }: Props) => {
  const { loading: deployLoading } = useSelector(rdiPipelineSelector)
  const { loading: actionLoading, action } = useSelector(rdiPipelineActionSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  const actionPipelineCallback = (event: TelemetryEvent, result: IActionPipelineResultProps) => {
    sendEventTelemetry({
      event,
      eventData: {
        id: rdiInstanceId,
        ...result,
      }
    })
    dispatch(getPipelineStatusAction(rdiInstanceId))
  }

  const onReset = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_RESET_CLICKED,
      eventData: {
        id: rdiInstanceId,
        pipelineStatus,
      }
    })
    dispatch(resetPipelineAction(
      rdiInstanceId,
      (result: IActionPipelineResultProps) =>
        actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_RESET, result),
      (result: IActionPipelineResultProps) =>
        actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_RESET, result)
    ))
  }

  const onStartPipeline = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_START_CLICKED,
      eventData: {
        id: rdiInstanceId,
      }
    })
    dispatch(startPipelineAction(
      rdiInstanceId,
      (result: IActionPipelineResultProps) =>
        actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_STARTED, result),
      (result: IActionPipelineResultProps) =>
        actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_STARTED, result),
    ))
  }

  const onStopPipeline = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_STOP_CLICKED,
      eventData: {
        id: rdiInstanceId,
      }
    })
    dispatch(stopPipelineAction(
      rdiInstanceId,
      (result) => actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_STOPPED, result),
      (result) => actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_STOPPED, result)
    ))
  }

  const isLoadingBtn = (actionBtn: PipelineAction) => action === actionBtn && actionLoading
  const disabled = deployLoading || actionLoading

  return (
    <EuiFlexGroup gutterSize="m" justifyContent="flexEnd" alignItems="center" responsive={false}>
      <EuiFlexItem grow={false}>
        <ResetPipelineButton
          onClick={onReset}
          disabled={disabled}
          loading={isLoadingBtn(PipelineAction.Reset)}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        {collectorStatus === CollectorStatus.Ready ? (
          <StopPipelineButton
            onClick={onStopPipeline}
            disabled={disabled}
            loading={isLoadingBtn(PipelineAction.Stop)}
          />
        ) : (
          <StartPipelineButton
            onClick={onStartPipeline}
            disabled={disabled}
            loading={isLoadingBtn(PipelineAction.Start)}
          />
        )}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <DeployPipelineButton
          loading={deployLoading}
          disabled={disabled}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ margin: 0 }}>
        <RdiConfigFileActionMenu />
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default PipelineActions
