import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { EuiBasicTableColumn } from '@elastic/eui'
import { AzureDatabase, LoadedAzure } from 'uiSrc/slices/interfaces'
import { Maybe } from 'uiSrc/utils'
import DatabasesBase from 'uiSrc/components/databases-list'
import { resetLoadedAzure } from 'uiSrc/slices/instances/microsoftAzure'
import { Pages } from 'uiSrc/constants'

interface Props {
  databases: Maybe<AzureDatabase[]>;
  loading: boolean;
  onSubmit: (databases: AzureDatabase[]) => void;
  onClose: () => void;
  columns: EuiBasicTableColumn<AzureDatabase>[];
}

const AzureDatabases = ({
  databases = [],
  columns,
  loading,
  onClose,
  onSubmit,
}: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const handleBackToSubscriptions = () => {
    dispatch(resetLoadedAzure(LoadedAzure.Instances))
    history.push(Pages.azureSubscriptions)
  }

  return (
    <DatabasesBase<AzureDatabase>
      title="Select Azure Redis Databases"
      databases={databases}
      columns={columns}
      loading={loading}
      onBack={handleBackToSubscriptions}
      showBackButton
      noResultsMessage="No Azure Redis databases found in the selected subscriptions."
      submitButtonText="Add Databases"
      cancelConfirmationTitle="Are you sure you want to cancel?"
      cancelConfirmationText="You will lose all your progress."
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

export default AzureDatabases
