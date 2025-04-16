import React from 'react'
import cx from 'classnames'
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import styles from './styles.module.scss'

export interface Props<T> {
  items: T[]
  children: (item: T, index: number) => React.ReactNode
  isClearDisabled: (item: T, index?: number) => boolean
  onClickRemove: (item: T, index?: number) => void
  onClickAdd: () => void
}

const AddMultipleFields = <T,>(props: Props<T>) => {
  const { items, children, isClearDisabled, onClickRemove, onClickAdd } = props

  const renderItem = (child: React.ReactNode, item: T, index?: number) => (
    <FlexItem
      key={index}
      className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace', styles.row)}
      grow
    >
      <Row align="center" gap="s">
        <FlexItem grow>{child}</FlexItem>
        <FlexItem>
          <EuiToolTip content="Remove" position="left">
            <EuiButtonIcon
              iconType="trash"
              isDisabled={isClearDisabled(item, index)}
              color="primary"
              aria-label="Remove Item"
              onClick={() => onClickRemove(item, index)}
              data-testid="remove-item"
            />
          </EuiToolTip>
        </FlexItem>
      </Row>
    </FlexItem>
  )

  return (
    <>
      {items.map((item, index) =>
        renderItem(children(item, index), item, index),
      )}
      <Spacer size="s" />
      <Row align="center" justify="end">
        <FlexItem>
          <EuiToolTip content="Add" position="left">
            <EuiButtonIcon
              className={styles.addBtn}
              iconType="plus"
              color="primary"
              aria-label="Add new item"
              onClick={onClickAdd}
              data-testid="add-item"
            />
          </EuiToolTip>
        </FlexItem>
      </Row>
    </>
  )
}

export default AddMultipleFields
