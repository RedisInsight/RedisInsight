import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { isNumber } from 'lodash'
import {
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'

import { Pages } from 'uiSrc/constants'
import {
  InstanceRedisCloud,
  LoadedCloud,
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
  RedisCloudSubscriptionStatusText,
  RedisCloudSubscriptionType,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import {
  cloudSelector,
  fetchInstancesRedisCloud,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import { formatLongName, Maybe, replaceSpaces, setTitle } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import RedisCloudSubscriptions from './RedisCloudSubscriptions/RedisCloudSubscriptions'

import styles from './styles.module.scss'

const RedisCloudSubscriptionsPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    credentials,
    subscriptions,
    loading,
    error: subscriptionsError,
    loaded: { instances: instancesLoaded },
    account: { error: accountError, data: account },
  } = useSelector(cloudSelector)

  setTitle('Redis Cloud Subscriptions')

  useEffect(() => {
    if (subscriptions === null) {
      history.push(Pages.home)
    }
  }, [])

  useEffect(() => {
    if (instancesLoaded) {
      history.push(Pages.redisCloudDatabases)
    }
  }, [instancesLoaded])

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

  const handleBackAdding = () => {
    sendCancelEvent()
    dispatch(resetLoadedRedisCloud(LoadedCloud.Subscriptions))
    history.push(Pages.home)
  }

  const handleLoadInstances = (
    subscriptions: Maybe<Pick<InstanceRedisCloud, 'subscriptionId' | 'subscriptionType' | 'free'>>[]
  ) => {
    dispatch(fetchInstancesRedisCloud({ subscriptions, credentials }))
  }

  const AlertStatusContent = () => (
    <ul className={styles.tooltipStatusList}>
      <li>
        <span className={styles.dot} />
        Subscription status is not Active
      </li>
      <li>
        <span className={styles.dot} />
        Subscription does not have any databases
      </li>
      <li>
        <span className={styles.dot} />
        Error fetching subscription details
      </li>
    </ul>
  )

  const columns: EuiBasicTableColumn<RedisCloudSubscription>[] = [
    {
      field: 'alert',
      className: 'column_status_alert',
      name: '',
      width: '20px',
      align: 'center',
      dataType: 'auto',
      render: function AlertIcon(alert: any, { status, numberOfDatabases }) {
        return status !== RedisCloudSubscriptionStatus.Active
          || numberOfDatabases === 0 ? (
            <EuiToolTip
              title={(
                <p>
                  This subscription is not available for one of the following
                  reasons:
                </p>
            )}
              content={<AlertStatusContent />}
              position="right"
              className={styles.tooltipStatus}
            >
              <EuiButtonIcon
                iconType="alert"
                color="subdued"
                aria-label="subscription alert"
              />
            </EuiToolTip>
          ) : null
      },
    },
    {
      field: 'id',
      className: 'column_id',
      name: 'Id',
      dataType: 'string',
      sortable: true,
      width: '90px',
      truncateText: true,
      render: (id: string) => <span data-testid={`id_${id}`}>{id}</span>,
    },
    {
      field: 'name',
      className: 'column_name',
      name: 'Subscription',
      dataType: 'auto',
      truncateText: true,
      sortable: true,
      width: '385px',
      render: function InstanceCell(name = '') {
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
      field: 'type',
      className: 'column_type',
      name: 'Type',
      width: '120px',
      dataType: 'string',
      sortable: true,
      render: (type: RedisCloudSubscriptionType) => RedisCloudSubscriptionTypeText[type] ?? '-',
    },
    {
      field: 'provider',
      className: 'column_provider',
      name: 'Cloud provider',
      width: '155px',
      dataType: 'string',
      sortable: true,
      render: (provider: string) => provider ?? '-',
    },
    {
      field: 'region',
      className: 'column_region',
      name: 'Region',
      width: '115px',
      dataType: 'string',
      sortable: true,
      render: (region: string) => region ?? '-',
    },
    {
      field: 'numberOfDatabases',
      className: 'column_num_of_dbs',
      name: '# databases',
      width: '120px',
      dataType: 'string',
      sortable: true,
      render: (numberOfDatabases: number) =>
        (isNumber(numberOfDatabases) ? numberOfDatabases : '-'),
    },
    {
      field: 'status',
      className: 'column_id',
      name: 'Status',
      dataType: 'string',
      width: '135px',
      sortable: true,
      render: (status: RedisCloudSubscriptionStatus) =>
        RedisCloudSubscriptionStatusText[status] ?? '-',
    },
  ]

  return (
    <RedisCloudSubscriptions
      columns={columns}
      subscriptions={subscriptions}
      loading={loading}
      account={account}
      error={subscriptionsError || accountError || ''}
      onClose={handleClose}
      onBack={handleBackAdding}
      onSubmit={handleLoadInstances}
    />
  )
}

export default RedisCloudSubscriptionsPage
