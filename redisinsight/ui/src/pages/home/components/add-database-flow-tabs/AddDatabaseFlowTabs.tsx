import React, { useCallback } from 'react'
import cx from 'classnames'
import { EuiTab, EuiTabs } from '@elastic/eui'

import { AddDbType } from 'uiSrc/pages/home/constants'
import styles from './styles.module.scss'

export interface Props {
  connectionType: AddDbType
  onChange: (type: AddDbType) => void
}

const TABS = [
  { id: 'cloud', title: 'Redis Cloud', connectionType: AddDbType.cloud },
  { id: 'software', title: 'Redis Software', connectionType: AddDbType.auto },
  { id: 'manual', title: 'Add manually', connectionType: AddDbType.manual },
  { id: 'import', title: 'Import from file', connectionType: AddDbType.import },
]

const AddDatabaseFlowTabs = (props: Props) => {
  const { connectionType, onChange } = props

  const renderTabs = useCallback(() => TABS.map(({ id, title, connectionType: type }) => (
    <EuiTab
      key={id}
      isSelected={connectionType === type}
      onClick={() => onChange(type)}
      data-testid={`add-database_tab_${id}`}
    >
      {title}
    </EuiTab>
  )), [connectionType])

  return (
    <div className={styles.tabsWrapper}>
      <EuiTabs
        className={cx(styles.tabs, 'tabs__default', 'tabs--noBorders')}
        data-testid="add-database-tabs"
      >
        {renderTabs()}
      </EuiTabs>
    </div>
  )
}

export default AddDatabaseFlowTabs
