import { EuiIcon } from '@elastic/eui'
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
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import {
  formatLongName,
  parseInstanceOptionsCloud,
  replaceSpaces,
  setTitle,
} from 'uiSrc/utils'
import {
  DatabaseListModules,
  DatabaseListOptions,
  RiTooltip,
} from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { ColumnDefinition } from 'uiSrc/components/base/layout/table'
import RedisCloudDatabasesResult from './RedisCloudDatabasesResult'

import styles from './styles.module.scss'

const RedisCloudDatabasesResultPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const { data: instancesForOptions, dataAdded: instances } =
    useSelector(cloudSelector)

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

  const columns: ColumnDefinition<InstanceRedisCloud>[] = [
    {
      header: 'Database',
      id: 'name',
      accessorKey: 'name',
      enableSorting: true,
      cell: function InstanceCell({
        row: {
          original: { name },
        },
      }) {
        const cellContent = replaceSpaces(name.substring(0, 200))
        return (
          <div role="presentation" data-testid={`db_name_${name}`}>
            <RiTooltip
              position="bottom"
              title="Database"
              className={styles.tooltipColumnName}
              content={formatLongName(name)}
            >
              <Text>{cellContent}</Text>
            </RiTooltip>
          </div>
        )
      },
    },
    {
      header: 'Subscription ID',
      id: 'subscriptionId',
      accessorKey: 'subscriptionId',
      enableSorting: true,
    },
    {
      header: 'Subscription',
      id: 'subscriptionName',
      accessorKey: 'subscriptionName',
      enableSorting: true,
      cell: function SubscriptionCell({
        row: {
          original: { subscriptionName: name },
        },
      }) {
        const cellContent = replaceSpaces(name.substring(0, 200))
        return (
          <div role="presentation">
            <RiTooltip
              position="bottom"
              title="Subscription"
              className={styles.tooltipColumnName}
              content={formatLongName(name)}
            >
              <Text>{cellContent}</Text>
            </RiTooltip>
          </div>
        )
      },
    },
    {
      header: 'Type',
      id: 'subscriptionType',
      accessorKey: 'subscriptionType',
      enableSorting: true,
      cell: ({
        row: {
          original: { subscriptionType },
        },
      }) => RedisCloudSubscriptionTypeText[subscriptionType!] ?? '-',
    },
    {
      header: 'Status',
      id: 'status',
      accessorKey: 'status',
      enableSorting: true,
    },
    {
      header: 'Endpoint',
      id: 'publicEndpoint',
      accessorKey: 'publicEndpoint',
      enableSorting: true,
      cell: function PublicEndpoint({
        row: {
          original: { publicEndpoint },
        },
      }) {
        const text = publicEndpoint
        return (
          <div className="public_endpoint">
            <Text className="copyPublicEndpointText">{text}</Text>
            <RiTooltip position="right" content="Copy">
              <IconButton
                icon={CopyIcon}
                aria-label="Copy public endpoint"
                className="copyPublicEndpointBtn"
                onClick={() => handleCopy(text)}
              />
            </RiTooltip>
          </div>
        )
      },
    },
    {
      header: 'Capabilities',
      id: 'modules',
      accessorKey: 'modules',
      enableSorting: true,
      cell: function Modules({ row: { original: instance } }) {
        return (
          <DatabaseListModules
            modules={instance.modules?.map((name) => ({ name }))}
          />
        )
      },
    },
    {
      header: 'Options',
      id: 'options',
      accessorKey: 'options',
      enableSorting: true,
      cell: function Opitions({ row: { original: instance } }) {
        const options = parseInstanceOptionsCloud(
          instance.databaseId,
          instancesForOptions,
        )
        return <DatabaseListOptions options={options} />
      },
    },
    {
      header: 'Result',
      id: 'messageAdded',
      accessorKey: 'messageAdded',
      enableSorting: true,
      cell: function Message({
        row: {
          original: { statusAdded, messageAdded },
        },
      }) {
        return (
          <>
            {statusAdded === AddRedisDatabaseStatus.Success ? (
              <Text>{messageAdded}</Text>
            ) : (
              <RiTooltip position="left" title="Error" content={messageAdded}>
                <Row align="center" gap="s">
                  <FlexItem>
                    <EuiIcon type="alert" color="danger" />
                  </FlexItem>

                  <FlexItem>
                    <ColorText
                      color="danger"
                      className="flex-row euiTextAlign--center"
                    >
                      Error
                    </ColorText>
                  </FlexItem>
                </Row>
              </RiTooltip>
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
