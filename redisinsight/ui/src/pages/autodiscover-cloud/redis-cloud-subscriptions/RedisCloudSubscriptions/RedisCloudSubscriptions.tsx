import React, { useState, useEffect } from 'react'
import { map } from 'lodash'
import {
  EuiInMemoryTable,
  EuiBasicTableColumn,
  EuiTableSelectionType,
  PropertySort,
  EuiButton,
  EuiPopover,
  EuiText,
  EuiTitle,
  EuiFieldSearch,
  EuiFormRow,
  EuiPage,
  EuiPageBody,
  EuiLoadingContent,
  EuiToolTip,
} from '@elastic/eui'
import cx from 'classnames'
import {
  InstanceRedisCloud,
  RedisCloudAccount,
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'uiSrc/slices/interfaces'
import { Maybe, Nullable } from 'uiSrc/utils'
import { PageHeader } from 'uiSrc/components'
import MessageBar from 'uiSrc/components/message-bar/MessageBar'
import validationErrors from 'uiSrc/constants/validationErrors'

import styles from '../styles.module.scss'

export interface Props {
  columns: EuiBasicTableColumn<RedisCloudSubscription>[];
  subscriptions: Nullable<RedisCloudSubscription[]>;
  loading: boolean;
  account: Nullable<RedisCloudAccount>;
  error: string;
  onClose: () => void;
  onBack: () => void;
  onSubmit: (subscriptions: Maybe<Pick<InstanceRedisCloud, 'subscriptionId' | 'subscriptionType' | 'free'>>[]) => void;
}

interface IPopoverProps {
  isPopoverOpen: boolean;
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
      status === RedisCloudSubscriptionStatus.Active && numberOfDatabases !== 0
  )?.length

  const countStatusFailed = items.length - countStatusActive

  const sort: PropertySort = {
    field: 'status',
    direction: 'asc',
  }

  const handleSubmit = () => {
    onSubmit(map(selection, ({ id, type, free }) => ({ subscriptionId: id, subscriptionType: type, free })))
  }

  const showPopover = () => {
    setIsPopoverOpen(true)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const selectionValue: EuiTableSelectionType<RedisCloudSubscription> = {
    selectable: ({ status, numberOfDatabases }) =>
      status === RedisCloudSubscriptionStatus.Active && numberOfDatabases !== 0,
    onSelectionChange: (selected: RedisCloudSubscription[]) => setSelection(selected),
  }

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value?.toLowerCase()
    const itemsTemp = subscriptions?.filter(
      (item: RedisCloudSubscription) =>
        item.name?.toLowerCase()?.indexOf(value) !== -1
          || item.id?.toString()?.toLowerCase().indexOf(value) !== -1
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
      button={(
        <EuiButton
          onClick={showPopover}
          color="secondary"
          className="btn-cancel"
          data-testid="btn-cancel"
        >
          Cancel
        </EuiButton>
      )}
    >
      <EuiText size="m">
        <p>
          Your changes have not been saved.&#10;&#13; Do you want to proceed to the list of
          databases?
        </p>
      </EuiText>
      <br />
      <div>
        <EuiButton fill size="s" color="warning" onClick={onClose} data-testid="btn-cancel-proceed">
          Proceed
        </EuiButton>
      </div>
    </EuiPopover>
  )

  const SubmitButton = ({ isDisabled }: { isDisabled: boolean }) => (
    <EuiToolTip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={isDisabled ? validationErrors.SELECT_AT_LEAST_ONE('subscription') : null}
      content={
        isDisabled ? (
          <span className="euiToolTip__content">{validationErrors.NO_SUBSCRIPTIONS_CLOUD}</span>
        ) : null
      }
    >
      <EuiButton
        fill
        size="m"
        disabled={isDisabled}
        onClick={handleSubmit}
        isLoading={loading}
        color="secondary"
        iconType={isDisabled ? 'iInCircle' : undefined}
        data-testid="btn-show-databases"
      >
        Show databases
      </EuiButton>
    </EuiToolTip>
  )

  const SummaryText = () => (
    <EuiText className={styles.subTitle}>
      <>
        <b>Summary: </b>
        {countStatusActive ? (
          <span>
            Successfully discovered database(s) in
            {' '}
            {countStatusActive}
            &nbsp;
            {countStatusActive > 1 ? 'subscriptions' : 'subscription'}
            .&nbsp;
          </span>
        ) : null}

        {countStatusFailed ? (
          <span>
            Failed to discover database(s) in
            {' '}
            {countStatusFailed}
            &nbsp;
            {countStatusFailed > 1 ? 'subscriptions.' : ' subscription.'}
          </span>
        ) : null}
      </>
    </EuiText>
  )

  const Account = () => (
    <>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Account ID:&nbsp;</span>
        <span color="subdued" data-testid="account-id">
          {account?.accountId ?? <EuiLoadingContent lines={1} />}
        </span>
      </span>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Name:&nbsp;</span>
        <span color="subdued" data-testid="account-name">
          {account?.accountName ?? <EuiLoadingContent lines={1} />}
        </span>
      </span>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Owner Name:&nbsp;</span>
        <span color="subdued" data-testid="account-owner-name">
          {account?.ownerName ?? <EuiLoadingContent lines={1} />}
        </span>
      </span>
      <span className={styles.account_item}>
        <span className={styles.account_item_title}>Owner Email:&nbsp;</span>
        <span color="subdued" data-testid="account-owner-email">
          {account?.ownerEmail ?? <EuiLoadingContent lines={1} />}
        </span>
      </span>
    </>
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
                <h1>Redis Cloud Subscriptions</h1>
              </EuiTitle>

              <MessageBar opened={countStatusActive + countStatusFailed > 0}>
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

              <div className={cx('databaseList', styles.cloudSubscriptions)}>
                <div className={styles.account}>
                  <Account />
                </div>
                <EuiInMemoryTable
                  items={items}
                  itemId="id"
                  loading={loading}
                  columns={columns}
                  sorting={{ sort }}
                  selection={selectionValue}
                  className={cx(styles.table, { [styles.tableEmpty]: !items.length })}
                  isSelectable
                />
                {!items.length && <EuiText className={styles.noSubscriptions}>{message}</EuiText>}
              </div>
            </div>
            <div className={cx(styles.footer, 'footerAddDatabase')}>
              <EuiButton
                onClick={onBack}
                color="secondary"
                className="btn-cancel btn-back"
                data-testid="btn-back-adding"
              >
                Back to adding databases
              </EuiButton>
              <CancelButton isPopoverOpen={isPopoverOpen} />
              <SubmitButton isDisabled={selection.length < 1} />
            </div>
          </div>
        </EuiPageBody>
      </EuiPage>
    </>
  )
}

export default RedisCloudSubscriptions
