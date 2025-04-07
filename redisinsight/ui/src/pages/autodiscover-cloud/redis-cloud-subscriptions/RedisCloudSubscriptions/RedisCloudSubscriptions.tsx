import React from 'react'
import { map } from 'lodash'
import { EuiBasicTableColumn, EuiLoadingContent } from '@elastic/eui'
import {
  InstanceRedisCloud,
  RedisCloudAccount,
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'uiSrc/slices/interfaces'
import { Maybe, Nullable } from 'uiSrc/utils'
import SubscriptionsBase from 'uiSrc/components/subscriptions-list'

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

const RedisCloudSubscriptions = ({
  subscriptions,
  columns,
  loading,
  account = null,
  error,
  onClose,
  onBack,
  onSubmit,
}: Props) => {
  const renderAccountInfo = () => (
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

  const renderSummary = (items: RedisCloudSubscription[]) => {
    const countStatusActive = items.filter(
      ({ status, numberOfDatabases }: RedisCloudSubscription) =>
        status === RedisCloudSubscriptionStatus.Active && numberOfDatabases !== 0
    )?.length

    const countStatusFailed = items.length - countStatusActive

    return (
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
    )
  }

  const handleSubmit = (selection: RedisCloudSubscription[]) => {
    onSubmit(map(selection, ({ id, type, free }) => ({ subscriptionId: id, subscriptionType: type, free })))
  }

  return (
    <SubscriptionsBase<RedisCloudSubscription>
      title="Redis Cloud Subscriptions"
      columns={columns}
      subscriptions={subscriptions}
      loading={loading}
      error={error}
      noResultsMessage="Your Redis Cloud has no subscriptions available."
      submitButtonText="Show databases"
      selectionFilter={({ status, numberOfDatabases }) => (
        status === RedisCloudSubscriptionStatus.Active && numberOfDatabases !== 0
      )}
      showBackButton
      renderAccountInfo={renderAccountInfo}
      renderSummary={renderSummary}
      onClose={onClose}
      onBack={onBack}
      onSubmit={handleSubmit}
    />
  )
}

export default RedisCloudSubscriptions
