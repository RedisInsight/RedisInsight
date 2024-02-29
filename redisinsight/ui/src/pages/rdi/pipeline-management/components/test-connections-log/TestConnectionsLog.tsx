import { EuiCollapsibleNavGroup } from '@elastic/eui'
import cx from 'classnames'
import React, { useState } from 'react'

import { Nullable } from 'uiSrc/utils'
import { ITestConnection } from 'uiSrc/slices/interfaces'
import TestConnectionsTable from 'uiSrc/pages/rdi/pipeline-management/components/test-connections-table'

import styles from './styles.module.scss'

enum ResultsStatus {
  Success = 'success',
  Failed = 'failed'
}

export interface Props {
  data: Nullable<ITestConnection>
}

const TestConnectionsLog = (props: Props) => {
  const { data } = props

  const [openedNav, setOpenedNav] = useState<string>(ResultsStatus.Success)

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

  const getNavGroupState = (name: ResultsStatus) => (openedNav === name ? 'open' : 'closed')

  return (
    <>
      <EuiCollapsibleNavGroup
        title={<CollapsibleNavTitle title="Connected successfully" length={data?.success?.length ?? 0} />}
        className={cx(styles.collapsibleNav, ResultsStatus.Success, { [styles.disabled]: !data?.success?.length })}
        isCollapsible
        initialIsOpen={false}
        onToggle={(isOpen) => onToggle(data?.success?.length, isOpen, ResultsStatus.Success)}
        forceState={getNavGroupState(ResultsStatus.Success)}
        data-testid={`success-connections-${getNavGroupState(ResultsStatus.Success)}`}
      >
        <TestConnectionsTable data={data?.success ?? []} />
      </EuiCollapsibleNavGroup>
      <EuiCollapsibleNavGroup
        title={<CollapsibleNavTitle title="Failed to connect" length={data?.fail?.length ?? 0} />}
        className={cx(styles.collapsibleNav, ResultsStatus.Failed, { [styles.disabled]: !data?.fail?.length })}
        isCollapsible
        initialIsOpen={false}
        onToggle={(isOpen) => onToggle(data?.fail?.length, isOpen, ResultsStatus.Failed)}
        forceState={getNavGroupState(ResultsStatus.Failed)}
        data-testid={`failed-connections-${getNavGroupState(ResultsStatus.Failed)}`}
      >
        <TestConnectionsTable data={data?.fail ?? []} />
      </EuiCollapsibleNavGroup>
    </>
  )
}

export default TestConnectionsLog
