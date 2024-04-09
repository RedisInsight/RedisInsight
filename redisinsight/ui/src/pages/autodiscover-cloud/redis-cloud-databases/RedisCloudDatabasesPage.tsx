import {
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import React, { useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import {
  addInstancesRedisCloud,
  cloudSelector,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import {
  formatLongName,
  parseInstanceOptionsCloud,
  replaceSpaces,
  setTitle,
} from 'uiSrc/utils'
import {
  InstanceRedisCloud,
  LoadedCloud, OAuthSocialAction,
  RedisCloudSubscriptionType,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import { DatabaseListModules, DatabaseListOptions } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import RedisCloudDatabases from './RedisCloudDatabases'

import styles from './styles.module.scss'

const RedisCloudDatabasesPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    ssoFlow,
    credentials,
    data: instances,
    dataAdded: instancesAdded,
  } = useSelector(cloudSelector)
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)
  const currentAccountIdRef = useRef(userOAuthProfile?.id)

  setTitle('Redis Cloud Databases')

  useEffect(() => {
    if (instances === null) {
      history.push(Pages.home)
    }

    dispatch(resetLoadedRedisCloud(LoadedCloud.Instances))
  }, [])

  useEffect(() => {
    if (ssoFlow !== OAuthSocialAction.Import) return

    if (!userOAuthProfile || currentAccountIdRef.current !== userOAuthProfile?.id) {
      dispatch(resetDataRedisCloud())
      history.push(Pages.home)
    }
  }, [ssoFlow, userOAuthProfile])

  useEffect(() => {
    if (instancesAdded.length) {
      history.push(Pages.redisCloudDatabasesResult)
    }
  }, [instancesAdded])

  const sendCancelEvent = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_CANCELLED,
    })
  }

  const handleClose = () => {
    sendCancelEvent()
    dispatch(resetDataRedisCloud())
    history.push(Pages.home)
  }

  const handleBackAdditing = () => {
    sendCancelEvent()
    dispatch(resetLoadedRedisCloud(LoadedCloud.Instances))
    history.push(Pages.home)
  }

  const handleAddInstances = (
    databases: Pick<InstanceRedisCloud, 'subscriptionId' | 'databaseId' | 'free'>[]
  ) => {
    dispatch(addInstancesRedisCloud({ databases, credentials }, ssoFlow === OAuthSocialAction.Import))
  }

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  const columns: EuiBasicTableColumn<InstanceRedisCloud>[] = [
    {
      field: 'name',
      className: 'column_name',
      name: 'Database',
      dataType: 'auto',
      truncateText: true,
      sortable: true,
      width: '195px',
      render: function InstanceCell(name: string = '') {
        const cellContent = replaceSpaces(name.substring(0, 200))
        return (
          <div role="presentation" data-testid={`db_name_${name}`}>
            <EuiToolTip
              position="bottom"
              title="Database"
              className={styles.tooltipColumnName}
              content={formatLongName(name)}
            >
              <EuiText>{cellContent}</EuiText>
            </EuiToolTip>
          </div>
        )
      },
    },
    {
      field: 'subscriptionId',
      className: 'column_subscriptionId',
      name: 'Subscription ID',
      dataType: 'string',
      sortable: true,
      width: '170px',
      truncateText: true,
      render: (subscriptionId: string) =>
        <span data-testid={`sub_id_${subscriptionId}`}>{subscriptionId}</span>,
    },
    {
      field: 'subscriptionName',
      className: 'column_subscriptionName',
      name: 'Subscription',
      dataType: 'string',
      sortable: true,
      width: '300px',
      truncateText: true,
      render: function SubscriptionCell(name: string = '') {
        const cellContent = replaceSpaces(name.substring(0, 200))
        return (
          <div role="presentation">
            <EuiToolTip
              position="bottom"
              title="Subscription"
              className={styles.tooltipColumnName}
              content={formatLongName(name)}
            >
              <EuiText>{cellContent}</EuiText>
            </EuiToolTip>
          </div>
        )
      },
    },
    {
      field: 'subscriptionType',
      className: 'column_subscriptionType',
      name: 'Type',
      width: '95px',
      dataType: 'string',
      sortable: true,
      truncateText: true,
      render: (type: RedisCloudSubscriptionType) => RedisCloudSubscriptionTypeText[type] ?? '-',
    },
    {
      field: 'status',
      className: 'column_status',
      name: 'Status',
      dataType: 'string',
      sortable: true,
      width: '110px',
      truncateText: true,
      hideForMobile: true,
    },
    {
      field: 'publicEndpoint',
      className: 'column_publicEndpoint',
      name: 'Endpoint',
      width: '310px',
      dataType: 'auto',
      truncateText: true,
      sortable: true,
      render: function PublicEndpoint(publicEndpoint: string) {
        const text = publicEndpoint
        return (
          <div className="public_endpoint">
            <EuiText className="copyPublicEndpointText">{text}</EuiText>
            <EuiToolTip
              position="right"
              content="Copy"
              anchorClassName="copyPublicEndpointTooltip"
            >
              <EuiButtonIcon
                iconType="copy"
                aria-label="Copy public endpoint"
                className="copyPublicEndpointBtn"
                onClick={() => handleCopy(text)}
              />
            </EuiToolTip>
          </div>
        )
      },
    },
    {
      field: 'modules',
      className: 'column_modules',
      name: 'Modules',
      dataType: 'auto',
      align: 'left',
      width: '200px',
      sortable: true,
      render: function Modules(modules: any[], instance: InstanceRedisCloud) {
        return <DatabaseListModules modules={instance.modules.map((name) => ({ name }))} />
      },
    },
    {
      field: 'options',
      className: 'column_options',
      name: 'Options',
      dataType: 'auto',
      align: 'left',
      width: '180px',
      sortable: true,
      render: function Opitions(opts: any[], instance: InstanceRedisCloud) {
        const options = parseInstanceOptionsCloud(
          instance.databaseId,
          instances || []
        )
        return <DatabaseListOptions options={options} />
      },
    },
  ]

  return (
    <RedisCloudDatabases
      onClose={handleClose}
      onBack={handleBackAdditing}
      onSubmit={handleAddInstances}
      columns={columns}
    />
  )
}

export default RedisCloudDatabasesPage
