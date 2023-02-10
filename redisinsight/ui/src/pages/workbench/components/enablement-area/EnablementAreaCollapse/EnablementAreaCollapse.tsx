import React from 'react'
import cx from 'classnames'
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  isMinimized: boolean
  setIsMinimized: (value: boolean) => void
}

const EnablementAreaCollapse = ({ isMinimized, setIsMinimized }: Props) => (
  <div className={cx(styles.wrapper, { [styles.minimized]: isMinimized })}>
    {isMinimized ? (
      <EuiToolTip
        content="Expand"
        position="top"
        display="inlineBlock"
        anchorClassName="flex-row"
      >
        <EuiButtonIcon
          className={styles.iconBtn}
          iconType="menuRight"
          color="subdued"
          size="m"
          onClick={() => setIsMinimized(false)}
          data-testid="expand-enablement-area"
          aria-label="expand-enablement-area"
        />
      </EuiToolTip>
    ) : (
      <EuiToolTip
        content="Collapse"
        position="top"
        display="inlineBlock"
        anchorClassName="flex-row"
      >
        <EuiButtonIcon
          className={cx(styles.iconBtn, styles.btnHide)}
          iconType="menuLeft"
          color="primary"
          size="m"
          onClick={() => setIsMinimized(true)}
          data-testid="collapse-enablement-area"
          aria-label="collapse-enablement-area"
        />
      </EuiToolTip>
    )}
  </div>
)

export default EnablementAreaCollapse
