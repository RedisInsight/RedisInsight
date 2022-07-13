import React from 'react'
import { EuiText } from '@elastic/eui'

import { KeyTypes } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import Divider from 'uiSrc/components/divider/Divider'
import GroupBadge from 'uiSrc/components/group-badge/GroupBadge'
import styles from './styles.module.scss'

export interface Props {
  title?: string
  filter: Nullable<KeyTypes>
  search: string
  children?: React.ReactElement
}

const BulkActionsInfo = (props: Props) => {
  const { children, filter, search, title = 'Delete Keys with', } = props

  return (
    <div className={styles.container} data-testid="bulk-actions-info">
      <div className={styles.header}>
        <EuiText color="subdued" className={styles.title}>{title}</EuiText>
        <EuiText color="subdued" className={styles.subTitle}>
          {filter && (
            <div className={styles.filter} data-testid="bulk-actions-info-filter">
              <span style={{ paddingRight: 6 }}>Key type:</span>
              <GroupBadge fill={false} type={filter} className={styles.badge} />
            </div>
          )}
          <div className={styles.search} data-testid="bulk-actions-info-search">
            Pattern:
            <span className={styles.match}>{` ${search}`}</span>
          </div>
        </EuiText>
      </div>
      <Divider colorVariable="separatorColor" className={styles.divider} />
      <div className={styles.children}>
        {children}
      </div>
    </div>
  )
}

export default BulkActionsInfo
