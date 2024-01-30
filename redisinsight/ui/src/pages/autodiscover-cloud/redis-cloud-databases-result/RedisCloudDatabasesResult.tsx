import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  EuiInMemoryTable,
  EuiBasicTableColumn,
  PropertySort,
  EuiButton,
  EuiText,
  EuiTitle,
  EuiFieldSearch,
  EuiFormRow,
  EuiPage,
  EuiPageBody,
} from '@elastic/eui'
import cx from 'classnames'
import {
  InstanceRedisCloud,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import { PageHeader } from 'uiSrc/components'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'

import styles from './styles.module.scss'

export interface Props {
  columns: EuiBasicTableColumn<InstanceRedisCloud>[];
  onView: () => void;
  onBack: () => void;
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'

const RedisCloudDatabaseListResult = ({ columns, onBack, onView }: Props) => {
  const [items, setItems] = useState<InstanceRedisCloud[]>([])
  const [message, setMessage] = useState(loadingMsg)

  const { loading, dataAdded: instances } = useSelector(cloudSelector)

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
      (item: InstanceRedisCloud) =>
        item.name?.toLowerCase().indexOf(value) !== -1
        || item.publicEndpoint?.toLowerCase().indexOf(value) !== -1
        || item.subscriptionId?.toString()?.indexOf(value) !== -1
        || item.subscriptionName?.toLowerCase().indexOf(value) !== -1
        || item.databaseId?.toString()?.indexOf(value) !== -1
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
    <>
      <PageHeader title="My Redis databases" />
      <div />
      <EuiPage>
        <EuiPageBody component="div">
          <div className="homePage">
            <div className="databaseContainer">
              <EuiTitle size="s" className={styles.title} data-testid="title">
                <h1>
                  Redis Enterprise Databases Added
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

              <div className="databaseList cloudDatabaseListResult">
                <EuiInMemoryTable
                  items={items}
                  itemId="uid"
                  loading={loading}
                  message={message}
                  columns={columns}
                  className={styles.table}
                  sorting={{ sort }}
                />
              </div>
            </div>
            <div className={cx(styles.footer, 'footerAddDatabase')}>
              <EuiButton
                onClick={onBack}
                color="secondary"
                className="btn-cancel btn-back"
                data-testid="btn-back-to-adding"
              >
                Back to adding databases
              </EuiButton>
              <EuiButton
                fill
                size="m"
                onClick={onView}
                color="secondary"
                data-testid="btn-view-databases"
              >
                View Databases
              </EuiButton>
            </div>
          </div>
        </EuiPageBody>
      </EuiPage>
    </>
  )
}

export default RedisCloudDatabaseListResult
