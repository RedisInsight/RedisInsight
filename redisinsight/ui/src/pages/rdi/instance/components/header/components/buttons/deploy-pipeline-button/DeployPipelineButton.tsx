import {
  EuiButton,
  EuiCheckbox,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiOutsideClickDetector,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui'
import cx from 'classnames'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import RocketIcon from 'uiSrc/assets/img/rdi/rocket.svg?react'
import { deployPipelineAction, getPipelineStatusAction, rdiPipelineSelector, resetPipelineChecked } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { createAxiosError, pipelineToJson } from 'uiSrc/utils'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { rdiErrorMessages } from 'uiSrc/pages/rdi/constants'
import styles from './styles.module.scss'

export interface Props {
  loading: boolean
  disabled: boolean
  onReset: () => void
}

const DeployPipelineButton = ({ loading, disabled, onReset }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [resetPipeline, setResetPipeline] = useState(false)

  const { config, jobs, resetChecked } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const dispatch = useDispatch()

  const updatePipelineStatus = () => {
    if (resetChecked) {
      dispatch(resetPipelineChecked(false))
      onReset?.()
    } else {
      dispatch(getPipelineStatusAction(rdiInstanceId))
    }
  }

  const handleDeployPipeline = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_DEPLOY_CLICKED,
      eventData: {
        id: rdiInstanceId,
        reset: resetPipeline,
        jobsNumber: jobs?.length
      }
    })
    setIsPopoverOpen(false)
    setResetPipeline(false)
    const JSONValues = pipelineToJson({ config, jobs }, (errors) => {
      dispatch(addErrorNotification(createAxiosError({
        message: rdiErrorMessages.invalidStructure(errors[0].filename, errors[0].msg)
      })))
    })
    if (!JSONValues) {
      return
    }
    dispatch(deployPipelineAction(rdiInstanceId, JSONValues, updatePipelineStatus,
      () => dispatch(getPipelineStatusAction(rdiInstanceId))),)
  }

  const handleClosePopover = () => {
    setIsPopoverOpen(false)
  }

  const handleClickDeploy = () => {
    setIsPopoverOpen(true)
  }

  const handleSelectReset = (reset: boolean) => {
    setResetPipeline(reset)
    dispatch(resetPipelineChecked(reset))
  }

  return (
    <EuiOutsideClickDetector onOutsideClick={handleClosePopover}>
      <EuiPopover
        closePopover={handleClosePopover}
        ownFocus
        initialFocus={false}
        className={styles.popoverAnchor}
        panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
        anchorClassName={styles.popoverAnchor}
        anchorPosition="upLeft"
        isOpen={isPopoverOpen}
        panelPaddingSize="m"
        focusTrapProps={{
          scrollLock: true
        }}
        button={(
          <EuiButton
            fill
            size="s"
            color="secondary"
            onClick={handleClickDeploy}
            iconType={RocketIcon}
            disabled={disabled}
            isLoading={loading}
            data-testid="deploy-rdi-pipeline"
          >
            Deploy Pipeline
          </EuiButton>
        )}
      >
        <EuiTitle size="xxs">
          <span>Are you sure you want to deploy the pipeline?</span>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiText size="s">When deployed, this local configuration will overwrite any existing pipeline.</EuiText>
        <EuiSpacer size="s" />
        <EuiText size="s">After deployment, consider flushing the target Redis database and resetting the pipeline to ensure that all data is reprocessed.</EuiText>
        <EuiSpacer size="s" />
        <div className={styles.checkbox}>
          <EuiCheckbox
            id="resetPipeline"
            name="resetPipeline"
            label="Reset"
            className={cx(styles.resetPipelineCheckbox, { [styles.checked]: resetPipeline })}
            checked={resetPipeline}
            onChange={(e) => handleSelectReset(e.target.checked)}
            data-testid="reset-pipeline-checkbox"
          />

          <EuiToolTip
            content="The pipeline will take a new snapshot of the data and process it, then continue tracking changes."
          >
            <EuiIcon
              type="iInCircle"
              size="m"
              style={{ cursor: 'pointer' }}
              data-testid="reset-checkbox-info-icon"
            />
          </EuiToolTip>
        </div>
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
              color="secondary"
              className={styles.popoverBtn}
              onClick={handleDeployPipeline}
              data-testid="deploy-confirm-btn"
            >
              Deploy
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPopover>
    </EuiOutsideClickDetector>
  )
}

export default DeployPipelineButton
