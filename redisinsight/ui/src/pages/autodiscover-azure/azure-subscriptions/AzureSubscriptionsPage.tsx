import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import {
  LoadedAzure,
  AzureSubscription,
} from 'uiSrc/slices/interfaces'
import {
  azureSelector,
  fetchInstancesAzure,
  fetchSubscriptionsAzure,
  resetLoadedAzure,
} from 'uiSrc/slices/instances/microsoftAzure'
import { Maybe } from 'uiSrc/utils'
import AzureSubscriptions from './AzureSubscriptions/AzureSubscriptions'

const AzureSubscriptionsPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    subscriptions,
    loading,
  } = useSelector(azureSelector)

  useEffect(() => {
    dispatch(fetchSubscriptionsAzure())
  }, [])

  const sendCancelEvent = () => {
    // sendEventTelemetry({
    //   event: TelemetryEvent.AZURE_AUTODISCOVERY_CANCELLED,
    //   eventData: {
    //     step: 'subscriptions',
    //   }
    // })
  }

  const handleClose = () => {
    sendCancelEvent()
    history.push(Pages.home)
  }

  const handleLoadInstances = (
    subscriptions: Maybe<AzureSubscription[]>
  ) => {
    dispatch(resetLoadedAzure(LoadedAzure.Instances))
    dispatch(fetchInstancesAzure({
      subscriptions: subscriptions ? subscriptions.map((sub) => ({ id: sub.id })) : []
    }))
    history.push(Pages.azureDatabases)
  }

  return (
    <AzureSubscriptions
      columns={[
        {
          field: 'name',
          name: 'Subscription Name',
          sortable: true,
          truncateText: true,
          width: '60%',
        },
        {
          field: 'id',
          name: 'Subscription ID',
          sortable: true,
          truncateText: true,
          width: '40%',
        },
      ]}
      subscriptions={subscriptions}
      loading={loading}
      onClose={handleClose}
      onSubmit={handleLoadInstances}
      onBack={handleClose}
    />
  )
}

export default AzureSubscriptionsPage
