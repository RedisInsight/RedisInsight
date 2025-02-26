import React from 'react'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle, EuiToolTip } from '@elastic/eui'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

const TooLongKeyNameDetails = ({ onClose }: { onClose: (key: RedisResponseBuffer) => void}) => (
  <div className={styles.container} data-testid="too-long-key-name-details">
    <EuiToolTip
      content="Close"
      position="left"
      anchorClassName={styles.closeRightPanel}
    >
      <EuiButtonIcon
        iconType="cross"
        color="primary"
        aria-label="Close key"
        className={styles.closeBtn}
        onClick={() => onClose(undefined)}
        data-testid="too-long-key-name-close-key-btn"
      />
    </EuiToolTip>
    <EuiFlexGroup alignItems="center" justifyContent="center">
      <EuiFlexItem className={styles.textWrapper}>
        <EuiTitle>
          <h4>The key name is too long</h4>
        </EuiTitle>
        <EuiText size="s">
          Details cannot be displayed.
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  </div>
)

export default TooLongKeyNameDetails
