import {
  Criteria,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiIcon,
  EuiLink,
  EuiPopover,
  EuiResizeObserver,
  EuiTableFieldDataColumnType,
  EuiText,
  EuiTextColor,
  EuiToolTip,
  PropertySort,
} from '@elastic/eui'
import cx from 'classnames'
import { saveAs } from 'file-saver'
import { capitalize, map } from 'lodash'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import AutoSizer from 'react-virtualized-auto-sizer'

import RediStackDarkMin from 'uiSrc/assets/img/modules/redistack/RediStackDark-min.svg'
import RediStackLightMin from 'uiSrc/assets/img/modules/redistack/RediStackLight-min.svg'
import RediStackDarkLogo from 'uiSrc/assets/img/modules/redistack/RedisStackLogoDark.svg'
import RediStackLightLogo from 'uiSrc/assets/img/modules/redistack/RedisStackLogoLight.svg'
import CloudLinkIcon from 'uiSrc/assets/img/oauth/cloud_link.svg?react'
import ThreeDots from 'uiSrc/assets/img/icons/three_dots.svg?react'
import DatabaseListModules from 'uiSrc/components/database-list-modules/DatabaseListModules'
import ItemList from 'uiSrc/components/item-list'
import { BrowserStorageItem, DEFAULT_SORT, FeatureFlags, Pages, Theme } from 'uiSrc/constants'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { localStorageService } from 'uiSrc/services'
import { appContextSelector, resetRdiContext } from 'uiSrc/slices/app/context'

import {
  checkConnectToInstanceAction,
  deleteInstancesAction,
  exportInstancesAction,
  setConnectedInstanceId,
} from 'uiSrc/slices/instances/instances'
import {
  CONNECTION_TYPE_DISPLAY,
  ConnectionType,
  Instance,
  OAuthSocialAction,
  OAuthSocialSource
} from 'uiSrc/slices/interfaces'
import { getRedisModulesSummary, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { formatLongName, getDbIndex, lastConnectionFormat, Nullable, replaceSpaces } from 'uiSrc/utils'

import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { CREATE_CLOUD_DB_ID, HELP_LINKS } from 'uiSrc/pages/home/constants'

import { Tag } from 'uiSrc/slices/interfaces/tag'
import { FeatureFlagComponent } from 'uiSrc/components'
import DbStatus from '../db-status'

import { TagsCell } from '../tags-cell/TagsCell'
import { TagsCellHeader } from '../tags-cell/TagsCellHeader'
import styles from './styles.module.scss'

export interface Props {
  instances: Instance[]
  predefinedInstances?: Instance[]
  loading: boolean
  editedInstance: Nullable<Instance>
  onEditInstance: (instance: Instance) => void
  onDeleteInstances: (instances: Instance[]) => void
  onManageInstanceTags: (instance: Instance) => void
}

const suffix = '_db_instance'
const COLS_TO_HIDE = ['connectionType', 'modules', 'lastConnection']
const isCreateCloudDb = (id?: string) => id === CREATE_CLOUD_DB_ID

const DatabasesListWrapper = (props: Props) => {
  const {
    instances,
    predefinedInstances = [],
    onEditInstance,
    editedInstance,
    onDeleteInstances,
    onManageInstanceTags,
    loading
  } = props
  const dispatch = useDispatch()
  const history = useHistory()
  const { search } = useLocation()
  const { theme } = useContext(ThemeContext)

  const { contextInstanceId } = useSelector(appContextSelector)
  const {
    [FeatureFlags.cloudSso]: cloudSsoFeature,
    [FeatureFlags.databaseManagement]: databaseManagementFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const [width, setWidth] = useState(0)
  const [, forceRerender] = useState({})
  const sortingRef = useRef<PropertySort>(
    localStorageService.get(BrowserStorageItem.instancesSorting) ?? DEFAULT_SORT
  )

  const deletingIdRef = useRef('')
  const controlsOpenIdRef = useRef('')

  const toggleControlsPopover = (instanceId: string) => {
    controlsOpenIdRef.current = controlsOpenIdRef.current === instanceId ? '' : instanceId
    forceRerender({})
  }

  const closePopover = () => {
    if (deletingIdRef.current) {
      deletingIdRef.current = ''
      forceRerender({})
    }
  }

  const showPopover = (id: string) => {
    deletingIdRef.current = `${id + suffix}`
    forceRerender({})
  }

  useEffect(() => {
    const editInstanceId = new URLSearchParams(search).get('editInstance')
    if (editInstanceId && instances?.length) {
      const instance = instances.find((item: Instance) => item.id === editInstanceId)
      if (instance) {
        handleClickEditInstance(instance)
        history.replace(Pages.home)
      }
    }
  }, [instances, search])

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
    dispatch(resetRdiContext())
    dispatch(setConnectedInstanceId(id))

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
        source: 'db_list',
        ...modulesSummary,
      }
    })
    dispatch(checkConnectToInstanceAction(id, connectToInstance, undefined, contextInstanceId !== id))
  }

  const handleClickDeleteInstance = ({ id, provider }: Instance) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_SINGLE_DATABASE_DELETE_CLICKED,
      eventData: {
        databaseId: id,
        provider
      }
    })
    showPopover(id)
  }

  const handleManageInstanceTags = (instance: Instance) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_MANAGE_TAGS_CLICKED,
      eventData: {
        databaseId: instance.id,
        provider: instance.provider,
      }
    })
    onManageInstanceTags(instance)
  }

  const handleClickEditInstance = (instance: Instance) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_EDIT_CLICKED,
      eventData: {
        databaseId: instance.id,
        provider: instance.provider,
      }
    })
    onEditInstance(instance)
  }

  const handleDeleteInstance = (instance: Instance) => {
    dispatch(deleteInstancesAction([instance], () => onDeleteInstances([instance])))
  }

  const handleDeleteInstances = (instances: Instance[]) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_MULTIPLE_DATABASES_DELETE_CLICKED,
      eventData: {
        ids: instances.map((instance) => instance.id)
      }
    })
    dispatch(deleteInstancesAction(instances, () => onDeleteInstances(instances)))
  }

  const handleExportInstances = (instances: Instance[], withSecrets: boolean) => {
    const ids = map(instances, 'id')

    sendEventTelemetry({ event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_CLICKED })

    dispatch(
      exportInstancesAction(
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
      )
    )
  }

  const onResize = ({ width: innerWidth }: { width: number }) => {
    setWidth(innerWidth)
  }

  const handleClickGoToCloud = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_LINK_CLICKED,
    })
  }

  const handleClickFreeDb = () => {
    if (cloudSsoFeature?.flag) {
      dispatch(setSSOFlow(OAuthSocialAction.Create))
      dispatch(setSocialDialogState(OAuthSocialSource.DatabaseConnectionList))
      sendEventTelemetry({
        event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
        eventData: { source: OAuthSocialSource.DatabaseConnectionList },
      })
      return
    }

    sendEventTelemetry({
      event: HELP_LINKS.cloud.event,
      eventData: { source: HELP_LINKS.cloud.sources.databaseConnectionList },
    })

    const link = document.createElement('a')
    link.setAttribute('href', getUtmExternalLink(EXTERNAL_LINKS.tryFree, { campaign: 'list_of_databases' }))
    link.setAttribute('target', '_blank')

    link.click()
    link.remove()
  }

  const getRowProps = (instance: Instance) => ({
    className: cx({
      'euiTableRow-isSelected': instance?.id === editedInstance?.id,
      cloudDbRow: isCreateCloudDb(instance?.id)
    }),
    onClick: isCreateCloudDb(instance?.id) ? handleClickFreeDb : undefined,
    isSelectable: !isCreateCloudDb(instance?.id),
    'data-testid': `db-row_${instance?.id}`
  })

  const controlsButton = (instanceId: string) => (
    <EuiButtonIcon
      iconType={ThreeDots}
      aria-label="Controls icon"
      data-testid={`controls-button-${instanceId}`}
      onClick={() => toggleControlsPopover(instanceId)}
    />
  )

  const columns: EuiTableFieldDataColumnType<Instance>[] = [
    {
      field: 'name',
      className: 'column_name',
      name: 'Database Alias',
      dataType: 'string',
      truncateText: true,
      'data-test-subj': 'database-alias-column',
      sortable: ({ name, id }) => {
        if (isCreateCloudDb(id)) return sortingRef.current.direction === 'asc' ? '' : false
        return name?.toLowerCase()
      },
      width: '200%',
      render: function InstanceCell(name: string = '', instance: Instance) {
        if (isCreateCloudDb(instance.id)) {
          return (
            <EuiText className={cx(styles.tooltipAnchorColumnName)}>{instance.name}</EuiText>
          )
        }

        const { id, db, new: newStatus = false, lastConnection, createdAt, cloudDetails } = instance
        const cellContent = replaceSpaces(name.substring(0, 200))

        return (
          <div role="presentation">
            <DbStatus
              id={id}
              isNew={newStatus}
              lastConnection={lastConnection}
              createdAt={createdAt}
              isFree={cloudDetails?.free}
            />
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
                <EuiTextColor className={cx(styles.tooltipColumnNameText, { [styles.withDb]: db })}>
                  {cellContent}
                </EuiTextColor>
                <EuiTextColor>{` ${getDbIndex(db)}`}</EuiTextColor>
              </EuiText>
            </EuiToolTip>
          </div>
        )
      },
    },
    {
      field: 'host',
      className: 'column_host',
      name: 'Host:Port',
      width: '200%',
      dataType: 'string',
      truncateText: true,
      sortable: ({ host, port, id }) => {
        if (isCreateCloudDb(id)) return sortingRef.current.direction === 'asc' ? '' : false
        return `${host}:${port}`
      },
      render: function HostPort(name: string, { host, port, id }: Instance) {
        if (isCreateCloudDb(id)) return host

        const text = `${name}:${port}`
        return (
          <div className="host_port" data-testid="host-port">
            <EuiText className="copyHostPortText">{text}</EuiText>
            <EuiToolTip position="right" content="Copy" anchorClassName="copyHostPortTooltip">
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
      sortable: ({ id, connectionType }) => {
        if (isCreateCloudDb(id)) return sortingRef.current.direction === 'asc' ? '' : false
        return connectionType
      },
      width: '150%',
      truncateText: true,
      hideForMobile: true,
      render: (cellData: ConnectionType) => CONNECTION_TYPE_DISPLAY[cellData] || capitalize(cellData)
    },
    {
      field: 'modules',
      className: styles.columnModules,
      name: 'Capabilities',
      width: '100%',
      dataType: 'string',
      render: (_cellData, { modules = [], isRediStack }: Instance) => (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <AutoSizer>
            {({ width: columnWidth }) => (
              <div style={{ width: columnWidth, height: 40, marginLeft: -6 }}>
                <DatabaseListModules
                  content={
                    isRediStack ? (
                      <EuiIcon
                        type={theme === Theme.Dark ? RediStackDarkMin : RediStackLightMin}
                        data-testid="redis-stack-icon"
                      />
                    ) : undefined
                  }
                  tooltipTitle={
                    isRediStack ? (
                      <>
                        <EuiIcon
                          type={theme === Theme.Dark ? RediStackDarkLogo : RediStackLightLogo}
                          className={styles.tooltipLogo}
                          data-testid="tooltip-redis-stack-icon"
                        />
                        <EuiText color="subdued" style={{ marginTop: 4, marginBottom: -4 }}>
                          Includes
                        </EuiText>
                      </>
                    ) : undefined
                  }
                  modules={modules}
                  maxViewModules={columnWidth && columnWidth > 40 ? Math.floor((columnWidth - 12) / 28) - 1 : 0}
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
      width: '140%',
      sortable: ({ lastConnection, id }) => {
        if (isCreateCloudDb(id)) return sortingRef.current.direction === 'asc' ? -Infinity : +Infinity
        return (lastConnection ? -new Date(`${lastConnection}`) : -Infinity)
      },
      render: (date: Date, { id }) => {
        if (id === CREATE_CLOUD_DB_ID) return null
        return lastConnectionFormat(date)
      },
    },
    {
      field: 'tags',
      dataType: 'auto',
      name: <TagsCellHeader />,
      width: '130%',
      sortable: ({ tags, id }) => {
        if (isCreateCloudDb(id)) return sortingRef.current.direction === 'asc' ? '' : '\uffff'
        return tags?.[0] ? `${tags[0].key}:${tags[0].value}` : null
      },
      render: (tags: Tag[], { id }) => {
        if (isCreateCloudDb(id) || !tags) return null
        return <TagsCell tags={tags} />
      },
    },
    {
      field: 'controls',
      className: 'column_controls',
      width: '80%',
      name: '',
      render: function Actions(_act: any, instance: Instance) {
        if (isCreateCloudDb(instance?.id)) return null
        return (
          <>
            <EuiToolTip content="Manage Tags" >
              <EuiButtonIcon
                iconType="tag"
                className={styles.tagsButton}
                aria-label="Manage Instance Tags"
                data-testid={`manage-instance-tags-${instance.id}`}
                onClick={() => handleManageInstanceTags(instance)}
              />
            </EuiToolTip>
            {instance.cloudDetails && (
              <EuiToolTip content="Go to Redis Cloud">
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
            <FeatureFlagComponent name={FeatureFlags.databaseManagement}>
              <EuiPopover
                ownFocus
                initialFocus={false}
                anchorPosition='leftUp'
                isOpen={controlsOpenIdRef.current === instance.id}
                closePopover={() => toggleControlsPopover('')}
                panelPaddingSize="s"
                button={controlsButton(instance.id)}
                data-testid={`controls-popover-${instance.id}`}
              >
                <div className="controlsPopoverContent">
                  <div>
                    <EuiButtonEmpty
                      iconType="pencil"
                      className="editInstanceBtn"
                      aria-label="Edit instance"
                      data-testid={`edit-instance-${instance.id}`}
                      onClick={() => handleClickEditInstance(instance)}
                    >
                      Edit database
                    </EuiButtonEmpty>
                  </div>
                  <div>
                    <PopoverDelete
                      header={formatLongName(instance.name, 50, 10, '...')}
                      text="will be removed from Redis Insight."
                      item={instance.id}
                      suffix={suffix}
                      deleting={deletingIdRef.current}
                      closePopover={closePopover}
                      updateLoading={false}
                      showPopover={showPopover}
                      handleDeleteItem={() => handleDeleteInstance(instance)}
                      handleButtonClick={() => handleClickDeleteInstance(instance)}
                      testid={`delete-instance-${instance.id}`}
                      buttonLabel="Remove database"
                    />
                  </div>
                </div>
              </EuiPopover>
            </FeatureFlagComponent>
          </>
        )
      },
    },
  ]

  const onTableChange = ({ sort, page }: Criteria<Instance>) => {
    // calls also with page changing
    if (sort && !page) {
      sortingRef.current = sort
      localStorageService.set(BrowserStorageItem.instancesSorting, sort)
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_DATABASE_LIST_SORTED,
        eventData: sort
      })
    }
  }

  const listOfInstances = [
    ...predefinedInstances,
    ...instances
  ]

  return (
    <EuiResizeObserver onResize={onResize}>
      {(resizeRef) => (
        <div className={styles.container} ref={resizeRef}>
          <ItemList<Instance>
            width={width}
            columns={columns}
            columnsToHide={COLS_TO_HIDE}
            onDelete={handleDeleteInstances}
            onExport={handleExportInstances}
            onWheel={closePopover}
            loading={loading}
            data={listOfInstances}
            rowProps={getRowProps}
            getSelectableItems={(item) => item.id !== 'create-free-cloud-db'}
            onTableChange={onTableChange}
            sort={sortingRef.current}
            hideSelectableCheckboxes={!databaseManagementFeature?.flag}
          />
        </div>
      )}
    </EuiResizeObserver>
  )
}

export default React.memo(DatabasesListWrapper)
