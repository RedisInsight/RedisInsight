import React, { ReactNode } from 'react'

import { EuiToolTip } from '@elastic/eui'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

const TextDetailsWrapper = ({
  onClose,
  children,
  testid,
}: {
  onClose: () => void
  children: ReactNode
  testid?: string
}) => {
  const getDataTestid = (suffix: string) =>
    testid ? `${testid}-${suffix}` : suffix

  return (
    <div className={styles.container} data-testid={getDataTestid('details')}>
      <EuiToolTip
        content="Close"
        position="left"
        anchorClassName={styles.closeRightPanel}
      >
        <IconButton
          icon={CancelSlimIcon}
          aria-label="Close key"
          className={styles.closeBtn}
          onClick={() => onClose()}
          data-testid={getDataTestid('close-key-btn')}
        />
      </EuiToolTip>
      <Row centered>
        <FlexItem className={styles.textWrapper}>
          <div>{children}</div>
        </FlexItem>
      </Row>
    </div>
  )
}

export default TextDetailsWrapper
