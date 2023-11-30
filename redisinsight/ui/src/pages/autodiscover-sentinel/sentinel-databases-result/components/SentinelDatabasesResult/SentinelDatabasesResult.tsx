import React, { useState, useEffect } from 'react'
import cx from 'classnames'
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
import { useSelector } from 'react-redux'

import { PageHeader } from 'uiSrc/components'
import { sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'

import styles from './styles.module.scss'

export interface Props {
  countSuccessAdded: number;
  columns: EuiBasicTableColumn<ModifiedSentinelMaster>[];
  masters: ModifiedSentinelMaster[];
  onBack: () => void;
  onViewDatabases: () => void;
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found.'

const SentinelDatabasesResult = ({
  columns,
  onBack,
  onViewDatabases,
  countSuccessAdded,
  masters,
}: Props) => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>(masters)
  const [message, setMessage] = useState(loadingMsg)

  const { loading } = useSelector(sentinelSelector)

  const countFailAdded = masters?.length - countSuccessAdded

  const sort: PropertySort = {
    field: 'message',
    direction: 'asc',
  }

  useEffect(() => {
    if (masters.length) {
      setItems(masters)
    }
  }, [masters])

  const handleViewDatabases = () => {
    onViewDatabases()
  }

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value?.toLowerCase()

    const itemsTemp = masters.filter(
      (item: ModifiedSentinelMaster) =>
        item.name?.toLowerCase().includes(value)
        || item.host?.toLowerCase().includes(value)
        || item.alias?.toLowerCase().includes(value)
        || item.username?.toLowerCase().includes(value)
        || item.port?.toString()?.includes(value)
        || item.numberOfSlaves?.toString().includes(value)
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const SummaryText = () => (
    <EuiText className={styles.subTitle} data-testid="summary">
      <b>Summary: </b>
      {countSuccessAdded ? (
        <span>
          Successfully added
          {' '}
          {countSuccessAdded}
          {' primary group(s)'}
          {countFailAdded ? '; ' : ' '}
        </span>
      ) : null}
      {countFailAdded ? (
        <span>
          Failed to add
          {' '}
          {countFailAdded}
          {' primary group(s)'}
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
                <h1>Auto-Discover Redis Sentinel Primary Groups</h1>
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

              <div className="databaseList sentinelDatabaseListResult">
                <EuiInMemoryTable
                  items={items}
                  itemId="id"
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
                onClick={handleViewDatabases}
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

export default SentinelDatabasesResult
