import React, { useEffect, useState } from 'react'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  children?: React.ReactElement;
  opened: boolean
}

const MessageBar = ({
  children,
  opened,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    setIsOpen(opened)
  }, [opened])

  return (
    isOpen ? (
      <div className={styles.inner}>
        <div className={styles.containerWrapper}>
          <EuiFlexGroup
            justifyContent="center"
            alignItems="center"
            className={styles.container}
            gutterSize="m"
            responsive={false}
          >
            <EuiFlexItem grow className={styles.text}>
              {children}
            </EuiFlexItem>
            <EuiFlexItem grow={false} className={styles.cross}>
              <EuiButtonIcon
                iconType="cross"
                color="primary"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
                data-testid="close-button"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </div>
    ) : null
  )
}

export default MessageBar
