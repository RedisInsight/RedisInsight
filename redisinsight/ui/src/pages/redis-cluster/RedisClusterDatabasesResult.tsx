import React, { useState, useEffect } from 'react'
import {
  EuiInMemoryTable,
  EuiBasicTableColumn,
  PropertySort,
  EuiTitle,
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

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

export interface Props {
  columns: EuiBasicTableColumn<InstanceRedisCluster>[]
  onView: (sendEvent?: boolean) => void
  onBack: (sendEvent?: boolean) => void
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
    ({ statusAdded }) => statusAdded === AddRedisDatabaseStatus.Success,
  )?.length

  const countFailAdded = instances.filter(
    ({ statusAdded }) => statusAdded === AddRedisDatabaseStatus.Fail,
  )?.length

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()
    const itemsTemp = instances.filter(
      (item: InstanceRedisCluster) =>
        item.name?.toLowerCase().indexOf(value) !== -1 ||
        item.dnsName?.toLowerCase().indexOf(value) !== -1 ||
        item.port?.toString().indexOf(value) !== -1,
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const SummaryText = () => (
    <Text>
      <b>Summary: </b>
      {countSuccessAdded ? (
        <span>
          Successfully added {countSuccessAdded} database(s)
          {countFailAdded ? '. ' : '.'}
        </span>
      ) : null}
      {countFailAdded ? (
        <span>Failed to add {countFailAdded} database(s).</span>
      ) : null}
    </Text>
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
        <Row align="end" gap="s">
          <FlexItem grow>
            <MessageBar opened={!!countSuccessAdded || !!countFailAdded}>
              <SummaryText />
            </MessageBar>
          </FlexItem>
          <FlexItem>
            <FormField className={styles.searchForm}>
              <SearchInput
                placeholder="Search..."
                className={styles.search}
                onChange={onQueryChange}
                aria-label="Search"
                data-testid="search"
              />
            </FormField>
          </FlexItem>
        </Row>
        <br />
        <div className="itemList databaseList clusterDatabaseListResult">
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
      <FlexItem className={cx(styles.footer, 'footerAddDatabase')}>
        <Row justify="between">
          <SecondaryButton
            onClick={() => onBack(false)}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </SecondaryButton>
          <PrimaryButton
            size="m"
            onClick={() => onView(false)}
            data-testid="btn-view-databases"
          >
            View Databases
          </PrimaryButton>
        </Row>
      </FlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisClusterDatabasesResult
