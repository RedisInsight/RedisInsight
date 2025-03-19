import React from 'react'
import { EuiBasicTableColumn } from '@elastic/eui'
import { AzureSubscription } from 'uiSrc/slices/interfaces'
import { Maybe, Nullable } from 'uiSrc/utils'
import SubscriptionsBase from 'uiSrc/components/subscriptions-list'

export interface Props {
  columns: EuiBasicTableColumn<AzureSubscription>[];
  subscriptions: Nullable<AzureSubscription[]>;
  loading: boolean;
  onClose: () => void;
  onSubmit: (subscriptions: Maybe<AzureSubscription[]>) => void;
  onBack: () => void;
}

const AzureSubscriptions = ({
  subscriptions = [],
  columns,
  loading,
  onClose,
  onSubmit,
  onBack,
}: Props) => (
  <SubscriptionsBase<AzureSubscription>
    title="Microsoft Azure Subscriptions"
    columns={columns}
    subscriptions={subscriptions}
    loading={loading}
    noResultsMessage="Your Azure account has no subscriptions available."
    submitButtonText="Next"
    showBackButton
    onBack={onBack}
    onClose={onClose}
    onSubmit={onSubmit}
  />
)

export default AzureSubscriptions
