import React, { useState, useEffect } from 'react'
import {
  EuiInMemoryTable,
  EuiBasicTableColumn,
  PropertySort,
} from '@elastic/eui'
import { useSelector } from 'react-redux'
import { SearchInput } from 'uiSrc/components/base/inputs'

import { sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import styles from './styles.module.scss'

export interface Props {
  countSuccessAdded: number
  columns: EuiBasicTableColumn<ModifiedSentinelMaster>[]
  masters: ModifiedSentinelMaster[]
  onBack: () => void
  onViewDatabases: () => void
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

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()

    const itemsTemp = masters.filter(
      (item: ModifiedSentinelMaster) =>
        item.name?.toLowerCase().includes(value) ||
        item.host?.toLowerCase().includes(value) ||
        item.alias?.toLowerCase().includes(value) ||
        item.username?.toLowerCase().includes(value) ||
        item.port?.toString()?.includes(value) ||
        item.numberOfSlaves?.toString().includes(value),
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const SummaryText = () => (
    <Text className={styles.subTitle} data-testid="summary">
      <b>Summary: </b>
      {countSuccessAdded ? (
        <span>
          Successfully added {countSuccessAdded}
          {' primary group(s)'}
          {countFailAdded ? '; ' : ' '}
        </span>
      ) : null}
      {countFailAdded ? (
        <span>
          Failed to add {countFailAdded}
          {' primary group(s)'}
        </span>
      ) : null}
    </Text>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <Title size="XXL" className={styles.title} data-testid="title">
          Auto-Discover Redis Sentinel Primary Groups
        </Title>

        <Row align="end" gap="s">
          <FlexItem grow>
            <MessageBar opened={!!countSuccessAdded || !!countFailAdded}>
              <SummaryText />
            </MessageBar>
          </FlexItem>
        </Row>
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
        <br />
        <div className="itemList databaseList sentinelDatabaseListResult">
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
      <FlexItem padding={4}>
        <Row gap="m" justify="between">
          <SecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </SecondaryButton>
          <PrimaryButton
            size="m"
            onClick={handleViewDatabases}
            data-testid="btn-view-databases"
          >
            View Databases
          </PrimaryButton>
        </Row>
      </FlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default SentinelDatabasesResult
