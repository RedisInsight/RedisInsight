import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  EuiInMemoryTable,
  EuiBasicTableColumn,
  PropertySort,
} from '@elastic/eui'
import {
  InstanceRedisCloud,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { Flex, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import styles from './styles.module.scss'

export interface Props {
  columns: EuiBasicTableColumn<InstanceRedisCloud>[]
  onView: () => void
  onBack: () => void
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
    ({ statusAdded }) => statusAdded === AddRedisDatabaseStatus.Success,
  )?.length

  const countFailAdded = instances.filter(
    ({ statusAdded }) => statusAdded === AddRedisDatabaseStatus.Fail,
  )?.length

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()

    const itemsTemp = instances.filter(
      (item: InstanceRedisCloud) =>
        item.name?.toLowerCase().indexOf(value) !== -1 ||
        item.publicEndpoint?.toLowerCase().indexOf(value) !== -1 ||
        item.subscriptionId?.toString()?.indexOf(value) !== -1 ||
        item.subscriptionName?.toLowerCase().indexOf(value) !== -1 ||
        item.databaseId?.toString()?.indexOf(value) !== -1,
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const SummaryText = () => (
    <Text className={styles.subTitle}>
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
        <Title size="XXL" className={styles.title} data-testid="title">
          Redis Enterprise Databases Added
        </Title>
        <Flex align="end" gap="s">
          <FlexItem grow>
            <MessageBar opened={!!countSuccessAdded || !!countFailAdded}>
              <SummaryText />
            </MessageBar>
          </FlexItem>
          <FlexItem>
            <FormField className={styles.searchForm}>
              <SearchInput
                placeholder="Search..."
                onChange={onQueryChange}
                aria-label="Search"
                data-testid="search"
              />
            </FormField>
          </FlexItem>
        </Flex>
        <br />
        <div className="itemList databaseList cloudDatabaseListResult">
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
      <FlexItem padding={4}>
        <Row justify="between">
          <SecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </SecondaryButton>
          <PrimaryButton onClick={onView} data-testid="btn-view-databases">
            View Databases
          </PrimaryButton>
        </Row>
      </FlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisCloudDatabaseListResult
