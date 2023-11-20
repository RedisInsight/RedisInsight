import {
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiText, EuiTextColor,
  EuiToolTip,
} from '@elastic/eui'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import {
  cloudSelector,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import {
  InstanceRedisCloud,
  AddRedisDatabaseStatus,
  LoadedCloud,
  RedisCloudSubscriptionType,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import {
  formatLongName,
  parseInstanceOptionsCloud,
  replaceSpaces,
  setTitle,
} from 'uiSrc/utils'
import { DatabaseListModules, DatabaseListOptions } from 'uiSrc/components'
import RedisCloudDatabasesResult from './RedisCloudDatabasesResult'

import styles from './styles.module.scss'

const RedisCloudDatabasesResultPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const { data: instancesForOptions, dataAdded: instances } = useSelector(cloudSelector)

  setTitle('Redis Enterprise Databases Added')

  useEffect(() => {
    if (!instances.length) {
      history.push(Pages.home)
    }
  }, [])

  const handleClose = () => {
    dispatch(resetDataRedisCloud())
    history.push(Pages.home)
  }

  const handleBackAdditing = () => {
    dispatch(resetLoadedRedisCloud(LoadedCloud.InstancesAdded))
    history.push(Pages.home)
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
      width: '95px',
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
        return <DatabaseListModules modules={instance.modules?.map((name) => ({ name }))} />
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
          instancesForOptions
        )
        return <DatabaseListOptions options={options} />
      },
    },
    {
      field: 'messageAdded',
      className: 'column_message',
      name: 'Result',
      dataType: 'string',
      align: 'left',
      width: '110px',
      sortable: true,
      render: function Message(
        messageAdded: string,
        { statusAdded }: InstanceRedisCloud
      ) {
        return (
          <>
            {statusAdded === AddRedisDatabaseStatus.Success ? (
              <EuiText>{messageAdded}</EuiText>
            ) : (
              <EuiToolTip position="left" title="Error" content={messageAdded}>
                <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
                  <EuiFlexItem grow={false}>
                    <EuiIcon type="alert" color="danger" />
                  </EuiFlexItem>

                  <EuiFlexItem grow={false}>
                    <EuiTextColor color="danger" className="flex-row euiTextAlign--center">
                      Error
                    </EuiTextColor>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiToolTip>
            )}
          </>
        )
      },
    },
  ]

  return (
    <RedisCloudDatabasesResult
      columns={columns}
      onView={handleClose}
      onBack={handleBackAdditing}
    />
  )
}

export default RedisCloudDatabasesResultPage
