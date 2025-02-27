import React, { ReactNode } from 'react';

import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiToolTip } from "@elastic/eui";

import styles from './styles.module.scss';

const TextDetailsWrapper = (
  { onClose, children }: { onClose: () => void, children: ReactNode }
) => (
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
      data-testid="close-key-btn"
    />
  </EuiToolTip>
  <EuiFlexGroup alignItems="center" justifyContent="center">
    <EuiFlexItem className={styles.textWrapper}>
      <div>{children}</div>
    </EuiFlexItem>
  </EuiFlexGroup>
</div>
);

export default TextDetailsWrapper;