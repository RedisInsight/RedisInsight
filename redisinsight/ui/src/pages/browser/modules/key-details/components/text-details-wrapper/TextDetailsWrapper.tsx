import React, { ReactNode } from 'react'

import { EuiButtonIcon, EuiToolTip } from '@elastic/eui'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
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
        <EuiButtonIcon
          iconType="cross"
          color="primary"
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
