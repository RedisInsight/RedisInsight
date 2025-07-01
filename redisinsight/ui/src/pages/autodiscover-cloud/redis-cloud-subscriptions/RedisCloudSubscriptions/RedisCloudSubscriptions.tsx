import React, { useState, useEffect } from 'react'
import { map } from 'lodash'
import { EuiPopover } from '@elastic/eui'
import cx from 'classnames'
import {
  InstanceRedisCloud,
  RedisCloudAccount,
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'uiSrc/slices/interfaces'
import { Maybe, Nullable } from 'uiSrc/utils'
import { LoadingContent } from 'uiSrc/components/base/layout'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiTooltip } from 'uiSrc/components'
import styles from '../styles.module.scss'

export interface Props {
  columns: ColumnDefinition<RedisCloudSubscription>[]
  subscriptions: Nullable<RedisCloudSubscription[]>
  loading: boolean
  account: Nullable<RedisCloudAccount>
  error: string
  onClose: () => void
  onBack: () => void
  onSubmit: (
    subscriptions: Maybe<
      Pick<InstanceRedisCloud, 'subscriptionId' | 'subscriptionType' | 'free'>
    >[],
  ) => void
}

interface IPopoverProps {
  isPopoverOpen: boolean
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'
const noResultsMessage = 'Your Redis Cloud has no subscriptions available.'

const RedisCloudSubscriptions = ({
  subscriptions,
  columns,
  loading,
  account = null,
  onClose,
  onBack,
  onSubmit,
}: Props) => {
  // const subscriptions = [];
  const [items, setItems] = useState(subscriptions || [])
  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const [selection, setSelection] = useState<RedisCloudSubscription[]>([])

  useEffect(() => {
    if (subscriptions !== null) {
      setItems(subscriptions)
    }

    if (subscriptions?.length === 0 && !loading) {
      setMessage(noResultsMessage)
    }
  }, [subscriptions, loading])

  const countStatusActive = items.filter(
    ({ status, numberOfDatabases }: RedisCloudSubscription) =>
      status === RedisCloudSubscriptionStatus.Active && numberOfDatabases !== 0,
  )?.length

  const countStatusFailed = items.length - countStatusActive

  const handleSubmit = () => {
    onSubmit(
      map(selection, ({ id, type, free }) => ({
        subscriptionId: id,
        subscriptionType: type,
        free,
      })),
    )
  }

  const showPopover = () => {
    setIsPopoverOpen(true)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const selectionValue = {
    onSelectionChange: (selected: RedisCloudSubscription) =>
      setSelection((previous) => {
        const canSelect =
          selected.status === RedisCloudSubscriptionStatus.Active &&
          selected.numberOfDatabases !== 0

        if (!canSelect) {
          return previous
        }

        const isSelected = previous.some(
          (item) => item.id === selected.id && item.type === selected.type,
        )
        if (isSelected) {
          return previous.filter(
            (item) => !(item.id === selected.id && item.type === selected.type),
          )
        }
        return [...previous, selected]
      }),
  }

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()
    const itemsTemp =
      subscriptions?.filter(
        (item: RedisCloudSubscription) =>
          item.name?.toLowerCase()?.indexOf(value) !== -1 ||
          item.id?.toString()?.toLowerCase().indexOf(value) !== -1,
      ) ?? []

    if (!itemsTemp?.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const CancelButton = ({ isPopoverOpen: popoverIsOpen }: IPopoverProps) => (
    <EuiPopover
      anchorPosition="upCenter"
      isOpen={popoverIsOpen}
      closePopover={closePopover}
      panelClassName={styles.panelCancelBtn}
      panelPaddingSize="l"
      button={
        <SecondaryButton
          onClick={showPopover}
          className="btn-cancel"
          data-testid="btn-cancel"
        >
          Cancel
        </SecondaryButton>
      }
    >
      <Text size="m">
        Your changes have not been saved.&#10;&#13; Do you want to proceed to
        the list of databases?
      </Text>
      <br />
      <div>
        <DestructiveButton
          size="s"
          onClick={onClose}
          data-testid="btn-cancel-proceed"
        >
          Proceed
        </DestructiveButton>
      </div>
    </EuiPopover>
  )

  const SubmitButton = ({ isDisabled }: { isDisabled: boolean }) => (
    <RiTooltip
      position="top"
      title={
        isDisabled ? validationErrors.SELECT_AT_LEAST_ONE('subscription') : null
      }
      content={
        isDisabled ? (
          <span className="euiToolTip__content">
            {validationErrors.NO_SUBSCRIPTIONS_CLOUD}
          </span>
        ) : null
      }
    >
      <PrimaryButton
        size="m"
        disabled={isDisabled}
        onClick={handleSubmit}
        loading={loading}
        icon={isDisabled ? InfoIcon : undefined}
        data-testid="btn-show-databases"
      >
        Show databases
      </PrimaryButton>
    </RiTooltip>
  )

  const SummaryText = () => (
    <Text className={styles.subTitle}>
      <b>Summary: </b>
      {countStatusActive ? (
        <span>
          Successfully discovered database(s) in {countStatusActive}
          &nbsp;
          {countStatusActive > 1 ? 'subscriptions' : 'subscription'}
          .&nbsp;
        </span>
      ) : null}

      {countStatusFailed ? (
        <span>
          Failed to discover database(s) in {countStatusFailed}
          &nbsp;
          {countStatusFailed > 1 ? 'subscriptions.' : ' subscription.'}
        </span>
      ) : null}
    </Text>
  )

  const Account = () => (
    <>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Account ID:&nbsp;</span>
        <span color="subdued" data-testid="account-id">
          {account?.accountId ?? <LoadingContent lines={1} />}
        </span>
      </span>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Name:&nbsp;</span>
        <span color="subdued" data-testid="account-name">
          {account?.accountName ?? <LoadingContent lines={1} />}
        </span>
      </span>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Owner Name:&nbsp;</span>
        <span color="subdued" data-testid="account-owner-name">
          {account?.ownerName ?? <LoadingContent lines={1} />}
        </span>
      </span>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Owner Email:&nbsp;</span>
        <span color="subdued" data-testid="account-owner-email">
          {account?.ownerEmail ?? <LoadingContent lines={1} />}
        </span>
      </span>
    </>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <Title size="XXL" className={styles.title} data-testid="title">
          Redis Cloud Subscriptions
        </Title>

        <Row align="end" gap="s">
          <FlexItem grow>
            <MessageBar opened={countStatusActive + countStatusFailed > 0}>
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

        <div
          className={cx('databaseList', 'itemList', styles.cloudSubscriptions)}
        >
          <div className={styles.account}>
            <Account />
          </div>
          <Table
            columns={columns}
            data={items}
            defaultSorting={[
              {
                id: 'name',
                desc: false,
              },
            ]}
            onRowClick={selectionValue.onSelectionChange}
          />
          {!items.length && (
            <Text className={styles.noSubscriptions}>{message}</Text>
          )}
        </div>
      </div>
      <FlexItem padding={4}>
        <Row gap="m" justify="between">
          <SecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-adding"
          >
            Back to adding databases
          </SecondaryButton>
          <FlexItem direction="row">
            <CancelButton isPopoverOpen={isPopoverOpen} />
            <SubmitButton isDisabled={selection.length < 1} />
          </FlexItem>
        </Row>
      </FlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisCloudSubscriptions
