import React from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiBasicTableColumn,
  EuiFlyout,
  EuiFlyoutBody,
  EuiInMemoryTable,
  EuiTitle,
} from '@elastic/eui'
import { appInfoSelector, setShortcutsFlyoutState } from 'uiSrc/slices/app/info'
import { KeyboardShortcut } from 'uiSrc/components'
import { BuildType } from 'uiSrc/constants/env'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { SHORTCUTS, ShortcutGroup, separator } from './schema'

import styles from './styles.module.scss'

const ShortcutsFlyout = () => {
  const { isShortcutsFlyoutOpen, server } = useSelector(appInfoSelector)

  const dispatch = useDispatch()

  const tableColumns: EuiBasicTableColumn<any>[] = [
    {
      name: '',
      field: 'description',
      width: '60%',
    },
    {
      name: '',
      field: 'keys',
      width: '40%',
      render: (items: string[]) => (
        <KeyboardShortcut items={items} separator={separator} transparent />
      ),
    },
  ]

  const ShortcutsTable = ({ name, items }: ShortcutGroup) => (
    <div key={name}>
      <EuiTitle size="xxs" data-test-subj={`shortcuts-section-${name}`}>
        <h6>{name}</h6>
      </EuiTitle>
      <Spacer size="m" />
      <EuiInMemoryTable
        className={cx('inMemoryTableDefault', styles.table)}
        columns={tableColumns}
        items={items}
        responsive={false}
      />
      <Spacer size="xl" />
    </div>
  )

  return isShortcutsFlyoutOpen ? (
    <EuiFlyout
      ownFocus
      size="538px"
      onClose={() => dispatch(setShortcutsFlyoutState(false))}
      data-test-subj="shortcuts-flyout"
    >
      <EuiFlyoutBody>
        <EuiTitle
          size="s"
          className={styles.title}
          data-testid="shortcuts-title"
        >
          <h4>Shortcuts</h4>
        </EuiTitle>
        <Spacer size="m" />
        {SHORTCUTS.filter(
          ({ excludeFor }) =>
            !excludeFor || !excludeFor.includes(server?.buildType as BuildType),
        ).map(ShortcutsTable)}
      </EuiFlyoutBody>
    </EuiFlyout>
  ) : null
}

export default ShortcutsFlyout
