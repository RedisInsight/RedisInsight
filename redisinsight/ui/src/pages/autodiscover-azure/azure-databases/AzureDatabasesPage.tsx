import {
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import {
  azureSelector,
  resetDataAzure,
  addDatabasesAzure,
} from 'uiSrc/slices/instances/microsoftAzure'
import { formatLongName, getAxiosError, setTitle } from 'uiSrc/utils'
import { EnhancedAxiosError, AzureDatabase, InstanceAzure } from 'uiSrc/slices/interfaces'
import { createInstanceStandaloneAction } from 'uiSrc/slices/instances/instances'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import AzureDatabases from './AzureDatabases/AzureDatabases'

import styles from './styles.module.scss'

const AzureDatabasesPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    data: databases,
    loading
  } = useSelector(azureSelector)

  useEffect(() => {
    setTitle('Azure Redis Databases')
  }, [])

  const sendCancelEvent = () => {
    // sendEventTelemetry({
    //   event: TelemetryEvent.AZURE_AUTODISCOVERY_CANCELLED,
    //   eventData: {
    //     step: 'databases',
    //   }
    // })
  }

  const handleClose = () => {
    sendCancelEvent()
    dispatch(resetDataAzure())
    history.push(Pages.home)
  }

  const handleAddDatabases = async (
    databases: AzureDatabase[]
  ) => {
    if (!databases.length) {
      return
    }

    try {
      // THIS IS JUST A MOCK UP FOR NOW TO OPEN THE DATABASE DIRECTLY SHOWCASING THE CONNECTION FOR TESTING PURPOSES!
      const selectedDatabase = databases[0]

      const connectionDetails: InstanceAzure = {
        name: selectedDatabase.name,
        host: selectedDatabase.properties?.host || '',
        port: selectedDatabase.properties?.port || 6379,
        password: selectedDatabase.properties?.password,
        tls: !!selectedDatabase.properties?.useSsl,
      }

      dispatch(addDatabasesAzure({ databases }))
      dispatch(createInstanceStandaloneAction(
        connectionDetails,
        undefined,
        (id) => history.push(Pages.browser(id))
      ))
    } catch (error) {
      const err = getAxiosError(error as EnhancedAxiosError)
      dispatch(addErrorNotification(err))
    }
  }

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  const columns: EuiBasicTableColumn<AzureDatabase>[] = [
    {
      field: 'name',
      name: 'Database Name',
      sortable: true,
      truncateText: true,
      width: '25%',
      render: function InstanceCell(name: string = '') {
        const formattedName = formatLongName(name, 30)
        return (
          <div className={styles.nameCell}>
            <EuiToolTip
              position="top"
              content={name}
            >
              <EuiText size="s">{formattedName}</EuiText>
            </EuiToolTip>
            <EuiToolTip
              position="top"
              content="Copy"
            >
              <EuiButtonIcon
                iconType="copy"
                aria-label="Copy"
                className={styles.copyButton}
                onClick={() => handleCopy(name)}
              />
            </EuiToolTip>
          </div>
        )
      },
    },
    {
      field: 'properties.host',
      name: 'Host',
      sortable: true,
      truncateText: true,
      width: '25%',
      render: function HostCell(host: string = '') {
        const formattedHost = formatLongName(host, 30)
        return (
          <div className={styles.nameCell}>
            <EuiToolTip
              position="top"
              content={host}
            >
              <EuiText size="s">{formattedHost}</EuiText>
            </EuiToolTip>
            <EuiToolTip
              position="top"
              content="Copy"
            >
              <EuiButtonIcon
                iconType="copy"
                aria-label="Copy"
                className={styles.copyButton}
                onClick={() => handleCopy(host)}
              />
            </EuiToolTip>
          </div>
        )
      },
    },
    {
      field: 'properties.port',
      name: 'Port',
      sortable: true,
      width: '10%',
    },
    {
      field: 'location',
      name: 'Location',
      sortable: true,
      width: '15%',
    },
    {
      field: 'subscriptionName',
      name: 'Subscription',
      sortable: true,
      truncateText: true,
      width: '25%',
    },
  ]

  return (
    <AzureDatabases
      columns={columns}
      databases={databases || []}
      loading={loading}
      onClose={handleClose}
      onSubmit={handleAddDatabases}
    />
  )
}

export default AzureDatabasesPage
