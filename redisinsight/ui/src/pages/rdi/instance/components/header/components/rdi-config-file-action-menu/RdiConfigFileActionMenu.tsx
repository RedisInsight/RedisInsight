import React, { useState } from 'react'
import {
  EuiPopover,
  EuiButtonIcon,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui'
import cx from 'classnames'
import threeDots from 'uiSrc/assets/img/rdi/three_dots.svg?react'
import uploadIcon from 'uiSrc/assets/img/rdi/upload.svg?react'
import UploadModal from 'uiSrc/pages/rdi/pipeline-management/components/upload-modal/UploadModal'
import Download from 'uiSrc/pages/rdi/instance/components/download'
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
    <EuiButtonIcon
      className={styles.threeDotsBtn}
      role="button"
      iconType={threeDots}
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
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popoverWrapper)}
      panelPaddingSize="none"
      anchorPosition="upRight"
    >
      <EuiFlexGroup direction="column" alignItems="flexStart" gutterSize="none">
        <EuiFlexItem>
          <FetchPipelinePopover onClose={closePopover} />
        </EuiFlexItem>
        <EuiFlexItem>
          <UploadModal onClose={closePopover}>
            <EuiButtonEmpty
              color="text"
              iconSize="m"
              className={styles.uploadBtn}
              iconType={uploadIcon}
              aria-labelledby="Upload pipeline button"
              data-testid="upload-file-btn"
            >
              Upload from file
            </EuiButtonEmpty>
          </UploadModal>
        </EuiFlexItem>
        <EuiFlexItem>
          <Download onClose={closePopover} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPopover>
  )
}

export default RdiConfigFileActionMenu
