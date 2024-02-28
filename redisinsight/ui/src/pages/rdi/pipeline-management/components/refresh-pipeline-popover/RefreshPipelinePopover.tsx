import {
  EuiButtonIcon,
  EuiSpacer,
  EuiText
} from '@elastic/eui'
import { useFormikContext } from 'formik'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import ConfirmationPopover from 'uiSrc/pages/rdi/components/confirmation-popover/ConfirmationPopover'
import { IPipeline } from 'uiSrc/slices/interfaces'
import { fetchRdiPipeline, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { Nullable } from 'uiSrc/utils'

const RefreshPipelinePopover = () => {
  const { loading, data } = useSelector(rdiPipelineSelector)

  const { setFieldValue, resetForm } = useFormikContext<IPipeline>()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  const handleRefreshClick = () => {
    dispatch(
      fetchRdiPipeline(rdiInstanceId, (pipeline: Nullable<IPipeline>) => {
        resetForm()
        setFieldValue('config', pipeline?.config)
        setFieldValue('jobs', pipeline?.jobs)
      })
    )
  }

  const handleRefreshWarning = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_REFRESH_CLICKED,
      eventData: {
        id: rdiInstanceId,
        jobsNumber: data?.jobs?.length || 'none'
      }
    })
  }

  return (
    <ConfirmationPopover
      title="Refresh a pipeline"
      body={(
        <>
          <EuiText size="s">
            A new pipeline will be uploaded from the RDI instance, which may result in overwriting details displayed in
            RedisInsight.
          </EuiText>
          <EuiSpacer size="s" />
          <EuiText size="s">You can download the pipeline displayed to save it locally.</EuiText>
        </>
      )}
      confirmButtonText="Refresh"
      onConfirm={handleRefreshClick}
      button={(
        <EuiButtonIcon
          size="xs"
          iconSize="s"
          iconType="refresh"
          disabled={loading}
          aria-labelledby="Refresh pipeline button"
          data-testid="refresh-pipeline-btn"
        />
      )}
      onButtonClick={handleRefreshWarning}
    />
  )
}

export default RefreshPipelinePopover
