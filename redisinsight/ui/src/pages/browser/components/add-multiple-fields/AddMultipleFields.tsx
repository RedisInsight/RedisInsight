import React from 'react'
import cx from 'classnames'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiToolTip } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props<T> {
  items: T[]
  children: (
    item: T,
    index: number
  ) => React.ReactNode
  isClearDisabled: (item: T) => boolean
  onClickRemove: (item: T) => void
  onClickAdd: () => void
}

const AddMultipleFields = <T,>(props: Props<T>) => {
  const {
    items,
    children,
    isClearDisabled,
    onClickRemove,
    onClickAdd,
  } = props

  const renderItem = (child: React.ReactNode, item: T, index?: number) => (
    <EuiFlexItem
      key={index}
      className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace', styles.row)}
      grow
    >
      <EuiFlexGroup alignItems="center" gutterSize="s">
        <EuiFlexItem grow>
          {child}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiToolTip
            content="Remove"
            position="left"
          >
            <EuiButtonIcon
              iconType="trash"
              isDisabled={isClearDisabled(item)}
              color="primary"
              aria-label="Remove Item"
              onClick={() => onClickRemove(item)}
              data-testid="remove-item"
            />
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  )

  return (
    <>
      {items.map((item, index) => renderItem(children(item, index), item, index))}
      <EuiSpacer size="s" />
      <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiToolTip
            content="Add"
            position="left"
          >
            <EuiButtonIcon
              className={styles.addBtn}
              iconType="plus"
              color="primary"
              aria-label="Add new item"
              onClick={onClickAdd}
              data-testid="add-item"
            />
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )
}

export default AddMultipleFields
