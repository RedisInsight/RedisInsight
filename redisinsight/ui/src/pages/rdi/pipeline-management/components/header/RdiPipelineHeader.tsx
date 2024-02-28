import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiOutsideClickDetector,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiTitle
} from '@elastic/eui'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { RdiPipeline } from 'src/modules/rdi/models'
import RocketIcon from 'uiSrc/assets/img/rdi/rocket.svg'
import Header from 'uiSrc/pages/rdi/components/header'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import styles from './styles.module.scss'

const RdiPipelineHeader = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { loading } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const { values, handleSubmit } = useFormikContext<RdiPipeline>()

  const handleDeployPipeline = () => {
    setIsPopoverOpen(false)
    handleSubmit()
  }

  const handleClosePopover = () => {
    setIsPopoverOpen(false)
  }

  const handleClickDeploy = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_DEPLOY_CLICKED,
      eventData: {
        id: rdiInstanceId,
        jobsNumber: values?.jobs?.length
      }
    })
    setIsPopoverOpen(true)
  }

  return (
    <Header
      actions={(
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
                disabled={loading}
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
      )}
    />
  )
}

export default RdiPipelineHeader
