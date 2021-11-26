import React from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiBasicTableColumn,
  EuiFlyout,
  EuiFlyoutBody,
  EuiInMemoryTable,
  EuiSpacer,
  EuiTitle
} from '@elastic/eui'
import { appInfoSelector, setShortcutsFlyoutState } from 'uiSrc/slices/app/info'
import { KeyboardShortcut } from 'uiSrc/components'
import { SHORTCUTS, ShortcutGroup, separator } from './schema'

import styles from './styles.module.scss'

const ShortcutsFlyout = () => {
  const { isShortcutsFlyoutOpen } = useSelector(appInfoSelector)

  const dispatch = useDispatch()

  const tableColumns: EuiBasicTableColumn<any>[] = [
    {
      name: '',
      field: 'description',
      width: '60%'
    },
    {
      name: '',
      field: 'keys',
      width: '40%',
      render: (items: string[]) => <KeyboardShortcut items={items} separator={separator} transparent />
    }
  ]

  const ShortcutsTable = ({ name, items }: ShortcutGroup) => (
    <div key={name}>
      <EuiTitle size="xxs" data-test-subj={`shortcut-title-${name}`}>
        <h6>{name}</h6>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiInMemoryTable
        className={cx('inMemoryTableDefault', styles.table)}
        columns={tableColumns}
        items={items}
        responsive={false}
      />
      <EuiSpacer size="xl" />
    </div>
  )

  return isShortcutsFlyoutOpen ? (
    <EuiFlyout
      ownFocus
      size="538px"
      onClose={() => dispatch(setShortcutsFlyoutState(false))}
    >
      <EuiFlyoutBody>
        <EuiTitle size="s" className={styles.title}>
          <h4>Shortcuts</h4>
        </EuiTitle>
        <EuiSpacer size="m" />
        {SHORTCUTS.map(ShortcutsTable)}
      </EuiFlyoutBody>
    </EuiFlyout>
  ) : null
}

export default ShortcutsFlyout
