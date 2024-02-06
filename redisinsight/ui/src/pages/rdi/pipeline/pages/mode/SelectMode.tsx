import React, {useEffect, useState} from 'react'
import { EuiCallOut, EuiText, EuiButton, EuiToolTip, EuiPopover, EuiIcon } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import ModeSwitcher from 'uiSrc/pages/rdi/pipeline/components/mode-switcher'
import { RdiPipelineMode } from 'uiSrc/slices/interfaces'
import { selectMode, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { Maybe } from 'uiSrc/utils'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import {sendEventTelemetry, sendPageViewTelemetry, TelemetryEvent, TelemetryPageView} from 'uiSrc/telemetry'

import styles from './styles.module.scss'

const SelectMode = () => {
  const { loading, mode: pipelineMode } = useSelector(rdiPipelineSelector)

  const [mode, setMode] = useState<Maybe<RdiPipelineMode>>(pipelineMode)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  const handleSelectMode = (mode: RdiPipelineMode) => {
    dispatch(selectMode(mode))
    setIsPopoverOpen(false)
    dispatch(addMessageNotification(successMessages.PIPELINE_MODE_CHANGED()))
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_MODE_SAVE_CLICKED,
      eventData: {
        id: rdiInstanceId,
        prevMode: mode || 'none',
      }
    })
  }

  const onSelectMode = () => {
    if (!pipelineMode) {
      handleSelectMode(mode)
    } else {
      setIsPopoverOpen(true)
    }
  }

  useEffect(() => {
    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_MODE_SELECTION,
    })
  }, [])

  return (
    <div className="content">
      <EuiCallOut
        title="Drafts won't be saved. Download or deploy the changes so you don't lose them."
        iconType="iInCircle"
        className={styles.warning}
      />
      <EuiText className="rdi__title">Pipeline mode configuration</EuiText>
      <EuiText className="rdi__text" color="subdued">Select a pipeline mode according to your scenario.</EuiText>
      <ModeSwitcher selectedMode={mode} setMode={setMode} />
      <div className={styles.info}>
        <EuiIcon type="iInCircle" />
        <EuiText className={styles.infoText} color="subdued">After selection continue to configuration page to proceed</EuiText>
      </div>
      <EuiPopover
        id="select-mode-warning-popover"
        anchorPosition="upCenter"
        isOpen={isPopoverOpen}
        closePopover={() => setIsPopoverOpen(false)}
        panelClassName="popover__wrapper"
        panelPaddingSize="none"
        className={styles.actions}
        button={(
          <EuiToolTip
            content={pipelineMode === mode ? 'Select a pipeline mode' : ''}
            position="top"
          >
            <EuiButton
              fill
              size="s"
              color="secondary"
              disabled={pipelineMode === mode }
              onClick={onSelectMode}
              isLoading={loading}
              data-testid="pipeline-mode-apply-btn"
            >
              Apply
            </EuiButton>
          </EuiToolTip>
          )}
      >
        <div data-testid="select-pipeline-confirmation">
          <EuiText className="popover__title">
            Are you sure you want to apply the changes?
          </EuiText>
          <EuiText className="popover__text">
            After changing the pipeline mode, the existing pipeline information will be removed from RedisInsight.
          </EuiText>
          <EuiText className="popover__text">
            When deployed, this local configuration will overwrite the existing pipeline in RDI.
          </EuiText>
          <EuiButton
            fill
            size="s"
            color="secondary"
            className="popover__action"
            onClick={() => handleSelectMode(mode)}
            data-testid="pipeline-mode-apply-popover-btn"
          >
            Apply
          </EuiButton>
        </div>
      </EuiPopover>
    </div>
  )
}

export default SelectMode
