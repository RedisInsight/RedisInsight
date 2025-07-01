import React, { useState } from 'react'
import { EuiPopover } from '@elastic/eui'
import cx from 'classnames'
import UploadModal from 'uiSrc/pages/rdi/pipeline-management/components/upload-modal/UploadModal'
import Download from 'uiSrc/pages/rdi/instance/components/download'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { EmptyButton, IconButton } from 'uiSrc/components/base/forms/buttons'
import { UploadIcon, MoreactionsIcon } from 'uiSrc/components/base/icons'
import FetchPipelinePopover from '../fetch-pipeline-popover'

import styles from './styles.module.scss'

const RdiConfigFileActionMenu = () => {
  const [isPopoverOpen, setPopover] = useState(false)

  const onButtonClick = () => {
    setPopover(!isPopoverOpen)
  }

  const closePopover = () => {
    setPopover(false)
  }

  const button = (
    <IconButton
      className={styles.threeDotsBtn}
      role="button"
      icon={MoreactionsIcon}
      onClick={onButtonClick}
      data-testid="rdi-config-file-action-menu-trigger"
      aria-label="rdi-config-file-action-menu-trigger"
    />
  )

  return (
    <EuiPopover
      id="rdiConfigFileActionsMenu"
      initialFocus={false}
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelClassName={cx('popoverLikeTooltip', styles.popoverWrapper)}
      panelPaddingSize="none"
      anchorPosition="upRight"
    >
      <Col align="start">
        <FlexItem grow>
          <FetchPipelinePopover onClose={closePopover} />
        </FlexItem>
        <FlexItem grow>
          <UploadModal onClose={closePopover}>
            <EmptyButton
              color="text"
              className={styles.uploadBtn}
              icon={UploadIcon}
              aria-labelledby="Upload pipeline button"
              data-testid="upload-file-btn"
            >
              Upload from file
            </EmptyButton>
          </UploadModal>
        </FlexItem>
        <FlexItem grow>
          <Download onClose={closePopover} />
        </FlexItem>
      </Col>
    </EuiPopover>
  )
}

export default RdiConfigFileActionMenu
