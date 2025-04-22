import React from 'react'
import { EuiButtonIcon } from '@elastic/eui'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import styles from './styles.module.scss'

export interface Props {
  width: number
  selectionCount: number
  actions: (JSX.Element | null)[]
  onCloseActionBar: () => void
}

const ActionBar = ({
  width,
  selectionCount,
  actions,
  onCloseActionBar,
}: Props) => (
  <div className={styles.inner}>
    <Row
      centered
      className={styles.container}
      gap="l"
      style={{
        left: `calc(${width / 2}px - 156px)`,
      }}
    >
      <FlexItem className={styles.text}>
        {`You selected: ${selectionCount} items`}
      </FlexItem>
      {actions?.map((action, index) => (
        <FlexItem className={styles.actions} key={index}>
          {action}
        </FlexItem>
      ))}
      <FlexItem className={styles.cross}>
        <EuiButtonIcon
          iconType="cross"
          color="primary"
          aria-label="Cancel selecting"
          onClick={() => onCloseActionBar()}
          data-testid="cancel-selecting"
        />
      </FlexItem>
    </Row>
  </div>
)

export default ActionBar
