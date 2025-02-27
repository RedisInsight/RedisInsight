import React, { ReactNode } from 'react';

import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiToolTip } from "@elastic/eui";

import styles from './styles.module.scss';

const CustomDetailsWrapper = ({ onClose, children }: { onClose: () => void, children: ReactNode }) => (
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
      onClick={() => onClose()}
      data-testid="too-long-key-name-close-key-btn"
    />
  </EuiToolTip>
  <EuiFlexGroup alignItems="center" justifyContent="center">
    <EuiFlexItem className={styles.textWrapper}>
      {children}
    </EuiFlexItem>
  </EuiFlexGroup>
</div>
);

export default CustomDetailsWrapper;