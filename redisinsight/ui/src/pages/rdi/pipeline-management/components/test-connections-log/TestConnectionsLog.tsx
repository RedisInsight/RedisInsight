import { EuiCollapsibleNavGroup } from '@elastic/eui'
import cx from 'classnames'
import React, { useState } from 'react'

import { Nullable } from 'uiSrc/utils'
import { TransformResult } from 'uiSrc/slices/interfaces'
import TestConnectionsTable from 'uiSrc/pages/rdi/pipeline-management/components/test-connections-table'

import styles from './styles.module.scss'

enum ResultsStatus {
  Success = 'success',
  Failed = 'failed'
}

export interface Props {
  data: Nullable<TransformResult>
}

const TestConnectionsLog = (props: Props) => {
  const { data } = props
  const statusData = data?.fail?.length ? data.fail : data?.success
  const status = data?.fail?.length ? ResultsStatus.Failed : ResultsStatus.Success
  const [openedNav, setOpenedNav] = useState<string>('')

  const onToggle = (length: number = 0, isOpen: boolean, name: string) => {
    if (length === 0) return
    setOpenedNav(isOpen ? name : '')
  }

  const CollapsibleNavTitle = ({ title, length = 0 }: { title: string, length: number }) => (
    <div className={styles.collapsibleNavTitle}>
      <span data-testid="nav-group-title">{title}:</span>
      <span data-testid="number-of-connections">{length}</span>
    </div>
  )

  const navTitle = status === ResultsStatus.Success ? 'Connected successfully' : 'Failed to connect'

  const getNavGroupState = (name: ResultsStatus) => (openedNav === name ? 'open' : 'closed')

  return (
    <EuiCollapsibleNavGroup
      title={<CollapsibleNavTitle title={navTitle} length={statusData?.length ?? 0} />}
      className={cx(styles.collapsibleNav, status, { [styles.disabled]: !statusData?.length })}
      isCollapsible
      initialIsOpen={false}
      onToggle={(isOpen) => onToggle(statusData?.length, isOpen, status)}
      forceState={getNavGroupState(status)}
      data-testid={`${status}-connections-${getNavGroupState(status)}`}
    >
      <TestConnectionsTable data={statusData ?? []} />
    </EuiCollapsibleNavGroup>
  )
}

export default TestConnectionsLog
