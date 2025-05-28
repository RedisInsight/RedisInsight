import React from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { EuiBasicTableColumn, EuiInMemoryTable } from '@elastic/eui'
import { appInfoSelector, setShortcutsFlyoutState } from 'uiSrc/slices/app/info'
import { KeyboardShortcut } from 'uiSrc/components'
import { BuildType } from 'uiSrc/constants/env'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
} from 'uiSrc/components/base/layout/drawer'
import { Title } from 'uiSrc/components/base/text/Title'
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
      <Title size="XS" data-test-subj={`shortcuts-section-${name}`}>
        {name}
      </Title>
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

  return (
    <Drawer
      open={isShortcutsFlyoutOpen}
      onOpenChange={(isOpen) => dispatch(setShortcutsFlyoutState(isOpen))}
      data-test-subj="shortcuts-flyout"
      title="Shortcuts"
    >
      <DrawerHeader title="Shortcuts" />
      <DrawerBody>
        {SHORTCUTS.filter(
          ({ excludeFor }) =>
            !excludeFor || !excludeFor.includes(server?.buildType as BuildType),
        ).map(ShortcutsTable)}
      </DrawerBody>
    </Drawer>
  )
}

export default ShortcutsFlyout
