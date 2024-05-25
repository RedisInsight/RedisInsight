import React, { useState, useEffect } from 'react'
import {
  EuiInMemoryTable,
  EuiBasicTableColumn,
  PropertySort,
  EuiButton,
  EuiText,
  EuiTitle,
  EuiFieldSearch,
  EuiFormRow,
} from '@elastic/eui'
import cx from 'classnames'
import { useSelector } from 'react-redux'

import {
  AddRedisDatabaseStatus,
  InstanceRedisCluster,
} from 'uiSrc/slices/interfaces'
import { setTitle } from 'uiSrc/utils'
import { clusterSelector } from 'uiSrc/slices/instances/cluster'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import styles from './styles.module.scss'

export interface Props {
  columns: EuiBasicTableColumn<InstanceRedisCluster>[];
  onView: (sendEvent?: boolean) => void;
  onBack: (sendEvent?: boolean) => void;
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'

const RedisClusterDatabasesResult = ({ columns, onBack, onView }: Props) => {
  const [items, setItems] = useState<InstanceRedisCluster[]>([])
  const [message, setMessage] = useState(loadingMsg)

  const { loading, dataAdded: instances } = useSelector(clusterSelector)

  setTitle('Redis Enterprise Databases Added')

  useEffect(() => setItems(instances), [instances])

  const sort: PropertySort = {
    field: 'name',
    direction: 'asc',
  }

  const countSuccessAdded = instances.filter(
    ({ statusAdded }) => statusAdded === AddRedisDatabaseStatus.Success
  )?.length

  const countFailAdded = instances.filter(
    ({ statusAdded }) => statusAdded === AddRedisDatabaseStatus.Fail
  )?.length

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value?.toLowerCase()
    const itemsTemp = instances.filter(
      (item: InstanceRedisCluster) =>
        item.name?.toLowerCase().indexOf(value) !== -1
        || item.dnsName?.toLowerCase().indexOf(value) !== -1
        || item.port?.toString().indexOf(value) !== -1
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const SummaryText = () => (
    <EuiText className={styles.subTitle}>
      <b>Summary: </b>
      {countSuccessAdded ? (
        <span>
          Successfully added
          {' '}
          {countSuccessAdded}
          {' '}
          database(s)
          {countFailAdded ? '. ' : '.'}
        </span>
      ) : null}
      {countFailAdded ? (
        <span>
          Failed to add
          {' '}
          {countFailAdded}
          {' '}
          database(s).
        </span>
      ) : null}
    </EuiText>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <EuiTitle size="s" className={styles.title} data-testid="title">
          <h1>
            Redis Enterprise
            {countSuccessAdded + countFailAdded > 1
              ? ' Databases '
              : ' Database '}
            Added
          </h1>
        </EuiTitle>
        <MessageBar
          opened={!!countSuccessAdded || !!countFailAdded}
        >
          <SummaryText />
        </MessageBar>
        <EuiFormRow className={styles.searchForm}>
          <EuiFieldSearch
            placeholder="Search..."
            className={styles.search}
            onChange={onQueryChange}
            isClearable
            aria-label="Search"
            data-testid="search"
          />
        </EuiFormRow>
        <br />

        <div className="databaseList clusterDatabaseListResult">
          <EuiInMemoryTable
            items={items}
            itemId="uid"
            loading={loading}
            message={message}
            columns={columns}
            sorting={{ sort }}
            className={styles.table}
          />
        </div>
      </div>
      <div className={cx(styles.footer, 'footerAddDatabase')}>
        <EuiButton
          onClick={() => onBack(false)}
          color="secondary"
          className="btn-cancel btn-back"
          data-testid="btn-back-to-adding"
        >
          Back to adding databases
        </EuiButton>
        <EuiButton
          fill
          size="m"
          onClick={() => onView(false)}
          color="secondary"
          data-testid="btn-view-databases"
        >
          View Databases
        </EuiButton>
      </div>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisClusterDatabasesResult
