import {
  EuiButtonIcon,
  EuiIcon,
  EuiLink,
  EuiTableFieldDataColumnType,
  EuiText,
  EuiTextColor,
  EuiToolTip,
} from '@elastic/eui'
import { capitalize, map } from 'lodash'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import cx from 'classnames'
import AutoSizer from 'react-virtualized-auto-sizer'

import { saveAs } from 'file-saver'
import {
  checkConnectToInstanceAction,
  deleteInstancesAction,
  exportInstancesAction,
  instancesSelector,
  setConnectedInstanceId,
} from 'uiSrc/slices/instances/instances'
import { CONNECTION_TYPE_DISPLAY, ConnectionType, Instance, } from 'uiSrc/slices/interfaces'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import { resetRedisearchKeysData } from 'uiSrc/slices/browser/redisearch'
import { PageNames, Pages, Theme } from 'uiSrc/constants'
import { getRedisModulesSummary, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { ShowChildByCondition } from 'uiSrc/components'
import { formatLongName, getDbIndex, lastConnectionFormat, Nullable, replaceSpaces } from 'uiSrc/utils'
import { appContextSelector, setAppContextInitialState } from 'uiSrc/slices/app/context'
import { resetCliHelperSettings, resetCliSettingsAction } from 'uiSrc/slices/cli/cli-settings'
import DatabaseListModules from 'uiSrc/components/database-list-modules/DatabaseListModules'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import RediStackDarkMin from 'uiSrc/assets/img/modules/redistack/RediStackDark-min.svg'
import RediStackLightMin from 'uiSrc/assets/img/modules/redistack/RediStackLight-min.svg'
import RediStackLightLogo from 'uiSrc/assets/img/modules/redistack/RedisStackLogoLight.svg'
import RediStackDarkLogo from 'uiSrc/assets/img/modules/redistack/RedisStackLogoDark.svg'
import { ReactComponent as CloudLinkIcon } from 'uiSrc/assets/img/oauth/cloud_link.svg'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import DatabasesList from './databases-list'

import styles from './styles.module.scss'

export interface Props {
  width: number
  editedInstance: Nullable<Instance>
  onEditInstance: (instance: Instance) => void
  onDeleteInstances: (instances: Instance[]) => void
}

const suffix = '_db_instance'
const COLS_TO_HIDE = ['connectionType', 'modules', 'lastConnection']

const DatabasesListWrapper = ({
  width,
  onEditInstance,
  editedInstance,
  onDeleteInstances
}: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search } = useLocation()
  const { theme } = useContext(ThemeContext)

  const { contextInstanceId, lastPage } = useSelector(appContextSelector)
  const instances = useSelector(instancesSelector)
  const [, forceRerender] = useState({})
  const deleting = { id: '' }
  const isLoadingRef = useRef(false)

  const closePopover = () => {
    deleting.id = ''
    forceRerender({})
  }

  const showPopover = (id: string) => {
    deleting.id = `${id + suffix}`
    forceRerender({})
  }

  useEffect(() => {
    const editInstanceId = new URLSearchParams(search).get('editInstance')
    if (editInstanceId && !instances.loading) {
      const instance = instances.data.find((item: Instance) => item.id === editInstanceId)
      if (instance) {
        handleClickEditInstance(instance)
      }
      setTimeout(() => {
        history.replace(Pages.home)
      }, 1000)
    }

    isLoadingRef.current = instances.loading
    forceRerender({})
  }, [instances.loading, search])

  useEffect(() => {
    closePopover()
  }, [width])

  const handleCopy = (text = '', databaseId?: string) => {
    navigator.clipboard?.writeText(text)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_HOST_PORT_COPIED,
      eventData: {
        databaseId
      }
    })
  }

  const connectToInstance = (id = '') => {
    if (contextInstanceId && contextInstanceId !== id) {
      dispatch(resetKeys())
      dispatch(resetRedisearchKeysData())
      dispatch(resetCliSettingsAction())
      dispatch(resetCliHelperSettings())
      dispatch(setAppContextInitialState())
    }
    dispatch(setConnectedInstanceId(id))

    if (lastPage === PageNames.workbench && contextInstanceId === id) {
      history.push(Pages.workbench(id))
      return
    }
    history.push(Pages.browser(id))
  }
  const handleCheckConnectToInstance = (
    event: React.MouseEvent | React.KeyboardEvent,
    { id, provider, modules }: Instance
  ) => {
    event.preventDefault()
    const modulesSummary = getRedisModulesSummary(modules)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: {
        databaseId: id,
        provider,
        ...modulesSummary,
      }
    })
    dispatch(checkConnectToInstanceAction(id, connectToInstance))
  }

  const handleClickDeleteInstance = (id: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_SINGLE_DATABASE_DELETE_CLICKED,
      eventData: {
        databaseId: id
      }
    })
    showPopover(id)
  }

  const handleClickEditInstance = (instance: Instance) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_EDIT_CLICKED,
      eventData: {
        databaseId: instance.id
      }
    })
    onEditInstance(instance)
  }

  const handleDeleteInstance = (instance: Instance) => {
    dispatch(deleteInstancesAction([instance], () => onDeleteInstances([instance])))
  }

  const handleDeleteInstances = (instances: Instance[]) => {
    dispatch(deleteInstancesAction(instances, () => onDeleteInstances(instances)))
  }

  const handleExportInstances = (instances: Instance[], withSecrets: boolean) => {
    const ids = map(instances, 'id')

    dispatch(exportInstancesAction(
      ids,
      withSecrets,
      (data) => {
        const file = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain;charset=utf-8' })
        saveAs(file, `RedisInsight_connections_${Date.now()}.json`)

        sendEventTelemetry({
          event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_SUCCEEDED,
          eventData: {
            numberOfDatabases: ids.length
          }
        })
      },
      () => {
        sendEventTelemetry({
          event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_FAILED,
          eventData: {
            numberOfDatabases: ids.length
          }
        })
      }
    ))
  }

  const handleClickGoToCloud = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_LINK_CLICKED,
    })
  }

  const columns: EuiTableFieldDataColumnType<Instance>[] = [
    {
      field: 'name',
      className: 'column_name',
      name: 'Database Alias',
      dataType: 'string',
      truncateText: true,
      'data-test-subj': 'database-alias-column',
      sortable: ({ name }) => name?.toLowerCase(),
      width: '30%',
      render: function InstanceCell(name: string = '', instance: Instance) {
        const { id, db, new: newStatus = false } = instance
        const cellContent = replaceSpaces(name.substring(0, 200))

        return (
          <div
            role="presentation"
          >
            {newStatus && (
              <ShowChildByCondition isShow={!isLoadingRef.current} innerClassName={styles.newStatusAnchor}>
                <EuiToolTip
                  content="New"
                  position="top"
                  anchorClassName={styles.newStatusAnchor}
                >
                  <div className={styles.newStatus} data-testid={`database-status-new-${id}`} />
                </EuiToolTip>
              </ShowChildByCondition>
            )}
            <ShowChildByCondition isShow={!isLoadingRef.current}>
              <EuiToolTip
                position="bottom"
                title="Database Alias"
                className={styles.tooltipColumnName}
                content={`${formatLongName(name)} ${getDbIndex(db)}`}
              >
                <EuiText
                  className={styles.tooltipAnchorColumnName}
                  data-testid={`instance-name-${id}`}
                  onClick={(e: React.MouseEvent) => handleCheckConnectToInstance(e, instance)}
                  onKeyDown={(e: React.KeyboardEvent) => handleCheckConnectToInstance(e, instance)}
                >
                  <EuiTextColor
                    className={cx(styles.tooltipColumnNameText, { [styles.withDb]: db })}
                  >
                    {cellContent}
                  </EuiTextColor>
                  <EuiTextColor>
                    {` ${getDbIndex(db)}`}
                  </EuiTextColor>
                </EuiText>
              </EuiToolTip>
            </ShowChildByCondition>
          </div>
        )
      },
    },
    {
      field: 'host',
      className: 'column_host',
      name: 'Host:Port',
      width: '35%',
      dataType: 'string',
      truncateText: true,
      sortable: ({ host, port }) => `${host}:${port}`,
      render: function HostPort(name: string, { port, id }: Instance) {
        const text = `${name}:${port}`
        return (
          <div className="host_port" data-testid="host-port">
            <EuiText className="copyHostPortText">{text}</EuiText>
            <EuiToolTip
              position="right"
              content="Copy"
              anchorClassName="copyHostPortTooltip"
            >
              <EuiButtonIcon
                iconType="copy"
                aria-label="Copy host:port"
                className="copyHostPortBtn"
                onClick={() => handleCopy(text, id)}
              />
            </EuiToolTip>
          </div>
        )
      },
    },
    {
      field: 'connectionType',
      className: 'column_type',
      name: 'Connection Type',
      dataType: 'string',
      sortable: true,
      width: '180px',
      truncateText: true,
      render: (cellData: ConnectionType) =>
        CONNECTION_TYPE_DISPLAY[cellData] || capitalize(cellData),
    },
    {
      field: 'modules',
      className: styles.columnModules,
      name: 'Modules',
      width: '30%',
      dataType: 'string',
      render: (_cellData, { modules = [], isRediStack }: Instance) => (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <AutoSizer>
            {({ width: columnWidth }) => (
              <div style={{ width: columnWidth, height: 40, marginLeft: -6 }}>
                <DatabaseListModules
                  content={isRediStack ? (
                    <EuiIcon
                      type={theme === Theme.Dark ? RediStackDarkMin : RediStackLightMin}
                      data-testid="redis-stack-icon"
                    />
                  ) : undefined}
                  tooltipTitle={isRediStack ? (
                    <>
                      <EuiIcon
                        type={theme === Theme.Dark ? RediStackDarkLogo : RediStackLightLogo}
                        className={styles.tooltipLogo}
                        data-testid="tooltip-redis-stack-icon"
                      />
                      <EuiText color="subdued" style={{ marginTop: 4, marginBottom: -4 }}>Includes</EuiText>
                    </>
                  ) : undefined}
                  modules={modules}
                  maxViewModules={columnWidth
                    ? ((columnWidth) > 40 ? (Math.floor((columnWidth - 12) / 28) - 1) : 0)
                    : 0}
                />
              </div>
            )}
          </AutoSizer>
        </div>
      ),
    },
    {
      field: 'lastConnection',
      className: 'column_lastConnection',
      name: 'Last connection',
      dataType: 'date',
      align: 'right',
      width: '170px',
      sortable: ({ lastConnection }) =>
        (lastConnection ? -new Date(`${lastConnection}`) : -Infinity),
      render: (date: Date) => lastConnectionFormat(date),
    },
    {
      field: 'controls',
      className: 'column_controls',
      width: '120px',
      name: '',
      render: function Actions(_act: any, instance: Instance) {
        return (
          <>
            {instance.cloudDetails && (
              <EuiToolTip
                content="Go to Redis Cloud"
              >
                <EuiLink
                  target="_blank"
                  external={false}
                  href={EXTERNAL_LINKS.cloudConsole}
                  onClick={handleClickGoToCloud}
                  data-testid={`cloud-link-${instance.id}`}
                >
                  <EuiIcon type={CloudLinkIcon} className={styles.cloudIcon} />
                </EuiLink>
              </EuiToolTip>
            )}
            <EuiButtonIcon
              iconType="pencil"
              className="editInstanceBtn"
              aria-label="Edit instance"
              data-testid={`edit-instance-${instance.id}`}
              onClick={() => handleClickEditInstance(instance)}
            />
            <PopoverDelete
              header={formatLongName(instance.name, 50, 10, '...')}
              text="will be deleted from RedisInsight."
              item={instance.id}
              suffix={suffix}
              deleting={deleting.id}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              handleDeleteItem={() => handleDeleteInstance(instance)}
              handleButtonClick={() => handleClickDeleteInstance(instance.id)}
              testid={`delete-instance-${instance.id}`}
            />
          </>
        )
      },
    },
  ]

  return (
    <div className={styles.container}>
      <DatabasesList
        width={width}
        editedInstance={editedInstance}
        columns={columns}
        columnsToHide={COLS_TO_HIDE}
        onDelete={handleDeleteInstances}
        onExport={handleExportInstances}
        onWheel={closePopover}
      />
    </div>
  )
}

export default React.memo(DatabasesListWrapper)
