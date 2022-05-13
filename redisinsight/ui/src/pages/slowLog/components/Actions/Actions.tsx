import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiToolTip
} from '@elastic/eui'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { DurationUnits } from 'uiSrc/pages/slowLog/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface Props {
  isEmptySlowLog: boolean
  durationUnit: DurationUnits
  onClear: () => void
  onRefresh: () => void
}

const Actions = (props: Props) => {
  const { isEmptySlowLog, durationUnit, onClear = () => {}, onRefresh } = props
  const { name = '', connectionType } = useSelector(connectedInstanceSelector)

  const [isPopoverClearOpen, setIsPopoverClearOpen] = useState(false)

  const showClearPopover = () => {
    setIsPopoverClearOpen((isPopoverClearOpen) => !isPopoverClearOpen)
  }

  const closePopoverClear = () => {
    setIsPopoverClearOpen(false)
  }

  const handleClearClick = () => {
    onClear()
    closePopoverClear()
  }

  const ToolTipContent = (
    <div className={styles.popoverContainer}>
      <EuiIcon type="alert" color="danger" className={styles.warningIcon} />
      <div>
        <EuiText size="m">
          <h4 className={styles.popoverTitle}>
            <b>Clear Slow Log?</b>
          </h4>
          <EuiText size="xs" color="subdued">
            Slow Log will be cleared for&nbsp;
            <span className={styles.popoverDBName}>{name}</span>
            <br />
            NOTE: This is server configuration
          </EuiText>
        </EuiText>
        <div className={styles.popoverFooter}>
          <EuiButton
            fill
            size="s"
            color="warning"
            iconType="eraser"
            onClick={() => handleClearClick()}
            className={styles.popoverDeleteBtn}
            data-testid="reset-confirm-btn"
          >
            Clear
          </EuiButton>
        </div>
      </div>
    </div>
  )

  return (
    <EuiFlexGroup className={styles.actions} gutterSize="s" alignItems="center" responsive={false}>
      <EuiFlexItem>
        <EuiToolTip
          content="Refresh"
          position="left"
          anchorClassName={styles.icon}
        >
          <EuiButtonIcon
            iconType="refresh"
            color="primary"
            aria-label="Refresh"
            onClick={() => onRefresh()}
            data-testid="refresh-btn"
          />
        </EuiToolTip>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiButton
          size="s"
          iconType="gear"
          color="secondary"
          aria-label="Configure"
          onClick={() => {}}
          data-testid="configure-btn"
          disabled={connectionType === ConnectionType.Cluster}
        >
          Configure
        </EuiButton>
      </EuiFlexItem>
      {!isEmptySlowLog && (
        <EuiFlexItem>
          <EuiPopover
            anchorPosition="leftCenter"
            ownFocus
            isOpen={isPopoverClearOpen}
            closePopover={closePopoverClear}
            panelPaddingSize="m"
            button={(
              <EuiButtonIcon
                iconType="eraser"
                className={styles.icon}
                color="primary"
                aria-label="Clear Slow Log"
                onClick={() => showClearPopover()}
                data-testid="clear-btn"
              />
            )}
          >
            {ToolTipContent}
          </EuiPopover>
        </EuiFlexItem>
      )}
      <EuiFlexItem>
        <EuiToolTip
          title="Slow Log"
          position="bottom"
          anchorClassName={styles.icon}
          content={(
            <span>
              Slow Log is a list of slow operations for your Redis instance. These can be used
              to troubleshoot performance issues.
              <EuiSpacer size="xs" />
              Each entry in the list displays the command, duration and timestamp.
              Any transaction that exceeds <b>slowlog-log-slower-than</b> {durationUnit} are recorded up to a
              maximum of <b>slowlog-max-len</b> after which older entries are discarded.
            </span>
          )}
        >
          <EuiIcon className={styles.infoIcon} type="iInCircle" style={{ cursor: 'pointer' }} />
        </EuiToolTip>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default Actions
