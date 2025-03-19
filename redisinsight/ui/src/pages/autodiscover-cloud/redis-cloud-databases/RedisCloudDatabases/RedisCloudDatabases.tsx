import React from 'react'
import { EuiBasicTableColumn } from '@elastic/eui'
import { map, pick } from 'lodash'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import DatabasesBase from 'uiSrc/components/databases-list'

export interface Props {
  loading: boolean;
  databases: InstanceRedisCloud[];
  columns: EuiBasicTableColumn<InstanceRedisCloud>[];
  onClose: () => void;
  onBack: () => void;
  onSubmit: (
    databases: Pick<InstanceRedisCloud, 'subscriptionId' | 'subscriptionType' | 'databaseId' | 'free'>[]
  ) => void;
}

const RedisCloudDatabases = ({
  columns,
  loading,
  databases,
  onClose,
  onBack,
  onSubmit,
}: Props) => {
  const handleSubmit = (selection: InstanceRedisCloud[]) => {
    onSubmit(map(selection, (i) => pick(i, 'subscriptionId', 'subscriptionType', 'databaseId', 'free')))
  }

  return (
    <DatabasesBase<InstanceRedisCloud>
      title="Redis Cloud Databases"
      databases={databases}
      columns={columns}
      loading={loading}
      noResultsMessage="Your Redis Enterprise Сloud has no databases available"
      submitButtonText="Add selected Databases"
      showBackButton
      backButtonText="Back to adding databases"
      cancelConfirmationTitle="Cancel adding databases?"
      cancelConfirmationText="Your changes have not been saved. Do you want to proceed to the list of databases?"
      onClose={onClose}
      onBack={onBack}
      onSubmit={handleSubmit}
    />
  )
}

export default RedisCloudDatabases
