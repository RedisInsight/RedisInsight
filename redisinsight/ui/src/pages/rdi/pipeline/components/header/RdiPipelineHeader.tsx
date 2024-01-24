import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiToolTip,
  EuiText,
  EuiButton,
  EuiTitle,
  EuiSpacer,
  EuiPopover,
  EuiOutsideClickDetector,
} from '@elastic/eui'
import { useFormikContext } from 'formik'

import { RdiPipeline } from 'src/modules/rdi/models'
import { Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import { ReactComponent as RocketIcon } from 'uiSrc/assets/img/rdi/rocket.svg'

import styles from './styles.module.scss'

const RdiPipelineHeader = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { name = '' } = useSelector(connectedInstanceSelector)
  const { loading } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const history = useHistory()
  const { values, handleSubmit } = useFormikContext<RdiPipeline>()

  const goHome = () => {
    history.push(Pages.rdi)
  }

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
        jobsNumber: values?.jobs?.length,
      },
    })
    setIsPopoverOpen(true)
  }

  return (
    <div className={cx(styles.container)}>
      <EuiFlexGroup style={{ height: '100%' }} gutterSize="none" alignItems="center" responsive={false}>
        <EuiFlexItem style={{ overflow: 'hidden' }}>
          <div className={styles.breadcrumbsContainer} data-testid="breadcrumbs-container">
            <div>
              <EuiToolTip
                position="bottom"
                content="My RDI instances"
              >
                <EuiText
                  className={styles.breadCrumbLink}
                  aria-label="My RDI instances"
                  data-testid="my-rdi-instances-btn"
                  onClick={goHome}
                  onKeyDown={goHome}
                >
                  RDI instances
                </EuiText>
              </EuiToolTip>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ maxWidth: '100%' }}>
                <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
                  <EuiFlexItem grow={false}>
                    <EuiText className={styles.divider}>&#62;</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem style={{ overflow: 'hidden' }}>
                    <b className={styles.rdiName} data-testid="rdi-instance-name">{name}</b>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
            </div>
          </div>
        </EuiFlexItem>
        <EuiFlexItem style={{ paddingLeft: 6 }} grow={false}>
          <EuiOutsideClickDetector
            onOutsideClick={handleClosePopover}
          >
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
              <EuiText size="s">
                When deployed, this local configuration will overwrite any existing pipeline.
              </EuiText>
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
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default RdiPipelineHeader
