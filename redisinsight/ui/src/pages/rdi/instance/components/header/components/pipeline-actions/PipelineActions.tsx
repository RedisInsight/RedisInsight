import React, { useCallback, useEffect } from 'react'
import {
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { get } from 'lodash'

import {
  getPipelineStatusAction,
  rdiPipelineActionSelector,
  rdiPipelineSelector,
  resetPipelineAction,
  setConfigValidationErrors,
  setIsPipelineValid,
  setJobsValidationErrors,
  startPipelineAction,
  stopPipelineAction
} from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { validateYamlSchema } from 'uiSrc/components/yaml-validator'
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
  const { loading: deployLoading, isPipelineValid, schema, config, jobs } = useSelector(rdiPipelineSelector)
  const { loading: actionLoading, action } = useSelector(rdiPipelineActionSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    const { valid: isConfigValid, errors: configErrors } = validateYamlSchema(
      config,
      get(schema, 'config', null),
    )

    if (!config && !jobs) {
      return
    }

    const { areJobsValid, jobErrors } = jobs.reduce<{
      areJobsValid: boolean
      jobErrors: string[]
    }>(
      (acc, j) => {
        const validation = validateYamlSchema(
          j.value,
          get(schema, 'jobs', null),
        )

        if (!validation.valid) {
          acc.jobErrors.push(...validation.errors)
        }

        acc.areJobsValid = acc.areJobsValid && validation.valid
        return acc
      },
      { areJobsValid: true, jobErrors: [] },
    )

    dispatch(setConfigValidationErrors([...new Set([...configErrors])]))
    dispatch(setJobsValidationErrors([...new Set([...jobErrors])]))

    const result = isConfigValid && areJobsValid

    if (isPipelineValid !== result) {
      dispatch(setIsPipelineValid(result))
    }
  }, [schema, config, jobs])

  const actionPipelineCallback = useCallback((event: TelemetryEvent, result: IActionPipelineResultProps) => {
    sendEventTelemetry({
      event,
      eventData: {
        id: rdiInstanceId,
        ...result,
      }
    })
    dispatch(getPipelineStatusAction(rdiInstanceId))
  }, [rdiInstanceId])

  const resetPipeline = useCallback(() => {
    dispatch(resetPipelineAction(
      rdiInstanceId,
      (result: IActionPipelineResultProps) =>
        actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_RESET, result),
      (result: IActionPipelineResultProps) =>
        actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_RESET, result)
    ))
  }, [rdiInstanceId])

  const onReset = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_RESET_CLICKED,
      eventData: {
        id: rdiInstanceId,
        pipelineStatus,
      }
    })
    resetPipeline()
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
  const isDeployButtonDisabled = disabled || !isPipelineValid

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
          disabled={isDeployButtonDisabled}
          onReset={resetPipeline}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ margin: 0 }}>
        <RdiConfigFileActionMenu />
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default PipelineActions
