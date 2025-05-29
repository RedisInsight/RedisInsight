import {
  EuiBasicTableColumn,
  EuiIcon,
  EuiText,
  EuiTextColor,
  EuiToolTip,
} from '@elastic/eui'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import {
  addInstancesRedisCluster,
  clusterSelector,
  resetDataRedisCluster,
  resetInstancesRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import {
  formatLongName,
  Maybe,
  parseInstanceOptionsCluster,
  setTitle,
} from 'uiSrc/utils'
import {
  AddRedisDatabaseStatus,
  InstanceRedisCluster,
} from 'uiSrc/slices/interfaces'
import { DatabaseListModules, DatabaseListOptions } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import RedisClusterDatabases from './RedisClusterDatabases'
import RedisClusterDatabasesResult from './RedisClusterDatabasesResult'

import styles from './styles.module.scss'

const RedisClusterDatabasesPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    credentials,
    data: instances,
    dataAdded: instancesAdded,
  } = useSelector(clusterSelector)
  setTitle('Auto-Discover Redis Enterprise Databases')

  const sendCancelEvent = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_CANCELLED,
    })
  }

  const handleClose = (sendEvent = true) => {
    sendEvent && sendCancelEvent()
    dispatch(resetDataRedisCluster())
    history.push(Pages.home)
  }

  const handleBackAdding = (sendEvent = true) => {
    sendEvent && sendCancelEvent()
    dispatch(resetInstancesRedisCluster())
    history.push(Pages.home)
  }

  const handleAddInstances = (uids: Maybe<number>[]) => {
    dispatch(addInstancesRedisCluster({ uids, credentials }))
  }

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  const columns: EuiBasicTableColumn<InstanceRedisCluster>[] = [
    {
      field: 'name',
      className: 'column_name',
      name: 'Database',
      dataType: 'auto',
      truncateText: true,
      sortable: true,
      width: '420px',
      render: function InstanceCell(name: string = '') {
        const cellContent = name
          .substring(0, 200)
          .replace(/\s\s/g, '\u00a0\u00a0')
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
      field: 'status',
      className: 'column_status',
      name: 'Status',
      dataType: 'string',
      sortable: true,
      width: '185px',
      truncateText: true,
      hideForMobile: true,
    },
    {
      field: 'dnsName',
      className: 'column_dnsName',
      name: 'Endpoint',
      width: '410px',
      dataType: 'auto',
      truncateText: true,
      sortable: true,
      render: function DnsName(
        dnsName: string,
        { port }: InstanceRedisCluster,
      ) {
        const text = `${dnsName}:${port}`
        return (
          !!dnsName && (
            <div className="host_port">
              <EuiText className="copyHostPortText">{text}</EuiText>
              <EuiToolTip
                position="right"
                content="Copy"
                anchorClassName="copyHostPortTooltip"
              >
                <IconButton
                  icon={CopyIcon}
                  aria-label="Copy host:port"
                  className="copyHostPortBtn"
                  onClick={() => handleCopy(text)}
                />
              </EuiToolTip>
            </div>
          )
        )
      },
    },
    {
      field: 'modules',
      className: 'column_modules',
      name: 'Capabilities',
      dataType: 'auto',
      align: 'left',
      width: '190px',
      sortable: true,
      render: function Modules(
        _modules: any[],
        instance: InstanceRedisCluster,
      ) {
        return (
          <DatabaseListModules
            modules={instance?.modules?.map((name) => ({ name }))}
          />
        )
      },
    },
    {
      field: 'options',
      className: 'column_options',
      name: 'Options',
      dataType: 'auto',
      align: 'left',
      width: '220px',
      sortable: true,
      render: function Opitions(_opts: any[], instance: InstanceRedisCluster) {
        const options = parseInstanceOptionsCluster(
          instance?.uid,
          instances || [],
        )
        return <DatabaseListOptions options={options} />
      },
    },
  ]

  const messageColumn: EuiBasicTableColumn<InstanceRedisCluster> = {
    field: 'messageAdded',
    className: 'column_message',
    name: 'Result',
    dataType: 'string',
    align: 'left',
    width: '110px',
    sortable: true,
    render: function Message(
      messageAdded: string,
      { statusAdded }: InstanceRedisCluster,
    ) {
      return (
        <>
          {statusAdded === AddRedisDatabaseStatus.Success ? (
            <EuiText>{messageAdded}</EuiText>
          ) : (
            <EuiToolTip position="left" title="Error" content={messageAdded}>
              <Row align="center" gap="s">
                <FlexItem>
                  <EuiIcon type="alert" color="danger" />
                </FlexItem>

                <FlexItem>
                  <EuiTextColor
                    color="danger"
                    className="flex-row euiTextAlign--center"
                  >
                    Error
                  </EuiTextColor>
                </FlexItem>
              </Row>
            </EuiToolTip>
          )}
        </>
      )
    },
  }

  const columnsResult: EuiBasicTableColumn<InstanceRedisCluster>[] = [
    ...columns,
  ]
  columnsResult.push(messageColumn)

  if (instancesAdded.length) {
    return (
      <RedisClusterDatabasesResult
        onView={handleClose}
        onBack={handleBackAdding}
        columns={columnsResult}
      />
    )
  }

  return (
    <RedisClusterDatabases
      onClose={handleClose}
      onBack={handleBackAdding}
      onSubmit={handleAddInstances}
      columns={columns}
    />
  )
}

export default RedisClusterDatabasesPage
