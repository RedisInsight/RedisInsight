import {
  EuiButton,
  EuiButtonIcon,
  EuiIcon,
  EuiPopover,
  EuiTableFieldDataColumnType,
  EuiText,
  EuiTextColor,
  EuiToolTip,
} from '@elastic/eui'
import { formatDistanceToNow } from 'date-fns'
import { capitalize } from 'lodash'
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import cx from 'classnames'

import {
  checkConnectToInstanceAction,
  deleteInstancesAction,
  instancesSelector,
  setConnectedInstanceId,
} from 'uiSrc/slices/instances'
import {
  CONNECTION_TYPE_DISPLAY,
  ConnectionType,
  Instance,
} from 'uiSrc/slices/interfaces'
import { resetKeys } from 'uiSrc/slices/keys'
import { PageNames, Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { formatLongName, getDbIndex, Nullable, replaceSpaces } from 'uiSrc/utils'
import { appContextSelector, setAppContextInitialState } from 'uiSrc/slices/app/context'
import { resetCliHelperSettings, resetCliSettingsAction } from 'uiSrc/slices/cli/cli-settings'
import DatabaseListModules, { ModulesListType } from 'uiSrc/components/database-list-modules/DatabaseListModules'
import RediStackSVG from 'uiSrc/assets/img/modules/RediStack.svg'
import { RedisModuleDto } from 'apiSrc/modules/instances/dto/database-instance.dto'
import DatabasesList from './DatabasesList/DatabasesList'

import styles from './styles.module.scss'

export interface Props {
  width: number;
  dialogIsOpen: boolean;
  editedInstance: Nullable<Instance>;
  onEditInstance: (instance: Instance) => void;
  onDeleteInstances: (instances: Instance[]) => void;
}
const DatabasesListWrapper = ({
  width,
  dialogIsOpen,
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
  const [deleting, setDeleting] = useState({ id: '' })

  const closePopover = () => {
    deleting.id = ''

    setDeleting(deleting)
    forceRerender({})
  }

  const showPopover = (instanceId = '') => {
    if (deleting.id === instanceId) {
      closePopover()
      return
    }
    deleting.id = instanceId

    setDeleting(deleting)
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
  }, [instances.loading, search])

  useEffect(() => {
    closePopover()
  }, [width])

  const handleCopy = (text = '', databaseId?: string) => {
    navigator.clipboard.writeText(text)
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
  const handleCheckConnectToInstance = (event: any, id = '') => {
    event.preventDefault()
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: {
        databaseId: id
      }
    })
    dispatch(checkConnectToInstanceAction(id, connectToInstance))
  }

  const handleClickDeleteInstance = (instance: Instance) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_SINGLE_DATABASE_DELETE_CLICKED,
      eventData: {
        databaseId: instance.id
      }
    })
    showPopover(instance.id)
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

  const PopoverDelete = ({ id, ...instance }: Instance) => (
    <EuiPopover
      key={id}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={id === deleting.id}
      closePopover={() => closePopover()}
      panelPaddingSize="l"
      anchorClassName="deleteInstancePopover"
      button={(
        <EuiButtonIcon
          iconType="trash"
          aria-label="Delete instance"
          className="deleteInstanceBtn"
          data-testid={`delete-instance-${id}`}
          onClick={() => handleClickDeleteInstance({ id, ...instance })}
        />
      )}
    >
      <EuiText size="m" style={{ overflow: 'hidden' }}>
        <p className={styles.popoverSubTitle}>
          <b style={{ wordBreak: 'break-all' }}>
            {formatLongName(instance.name, 50, 10, '...')}
          </b>
          &nbsp;will be deleted from RedisInsight.
        </p>
      </EuiText>
      <div className={styles.popoverFooter}>
        <EuiButton
          fill
          size="s"
          color="warning"
          iconType="trash"
          data-testid={`delete-instance-confirm-${id}`}
          onClick={() => handleDeleteInstance({ id, ...instance })}
        >
          Delete
        </EuiButton>
      </div>
    </EuiPopover>
  )

  const columnsFull: EuiTableFieldDataColumnType<Instance>[] = [
    {
      field: 'name',
      className: 'column_name',
      name: 'Database Alias',
      dataType: 'string',
      truncateText: true,
      'data-test-subj': 'database-alias-column',
      sortable: ({ name }) => name?.toLowerCase(),
      width: '30%',
      render: function InstanceCell(name: string = '', { id, db }: Instance) {
        const cellContent = replaceSpaces(name.substring(0, 200))
        return (
          <div
            role="presentation"
          >
            <EuiToolTip
              position="bottom"
              title="Database Alias"
              className={styles.tooltipColumnName}
              content={`${formatLongName(name)} ${getDbIndex(db)}`}
            >
              <span className={styles.tooltipAnchorColumnName} data-testid={`instance-name-${id}`}>
                <EuiTextColor
                  className={cx(styles.tooltipColumnNameText, { [styles.withDb]: db })}
                  onClick={(e) => handleCheckConnectToInstance(e, id)}
                  onKeyDown={(e) => handleCheckConnectToInstance(e, id)}
                >
                  {cellContent}
                </EuiTextColor>
                <EuiTextColor>
                  {` ${getDbIndex(db)}`}
                </EuiTextColor>
              </span>
            </EuiToolTip>
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
      hideForMobile: true,
      render: (cellData: ConnectionType) =>
        CONNECTION_TYPE_DISPLAY[cellData] || capitalize(cellData),
    },
    {
      field: 'modules',
      className: 'column_modules',
      name: 'Modules',
      width: '150px',
      dataType: 'string',
      render: (cellData, { modules = [], port, isRediStack }: Instance) => {
        return (
          <DatabaseListModules
            highlight={isRediStack}
            modules={modules}
            maxViewModules={3}
            tooltipTitle={isRediStack ? (
              <>
                <EuiIcon type={RediStackSVG} className={styles.redistackIcon} />
                <span style={{ verticalAlign: 'middle' }}>Redis Stack</span>
              </>
            ) : ''}
          />
        )
      },
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
      render: (date: Date) =>
        (date
          ? `${formatDistanceToNow(new Date(date), { addSuffix: true })}`
          : 'Never'),
    },
    {
      field: 'controls',
      className: 'column_controls',
      width: '100px',
      name: '',
      render: function Icons(name: string, instance: Instance) {
        return (
          <>
            <EuiButtonIcon
              iconType="pencil"
              className="editInstanceBtn"
              aria-label="Edit instance"
              data-testid={`edit-instance-${instance.id}`}
              onClick={() => handleClickEditInstance(instance)}
            />
            {PopoverDelete(instance)}
          </>
        )
      },
    },
  ]

  const columnsHideForTablet = ['connectionType']
  const columnsHideForEditing = ['connectionType', 'modules']
  const columnsTablet = columnsFull.filter(
    ({ field = '' }) => columnsHideForTablet.indexOf(field) === -1
  )
  const columnsEditing = columnsFull.filter(
    ({ field }) => columnsHideForEditing.indexOf(field) === -1
  )

  const columnVariations = [columnsFull, columnsEditing, columnsTablet]

  return (
    <DatabasesList
      width={width}
      editedInstance={editedInstance}
      dialogIsOpen={dialogIsOpen}
      columnVariations={columnVariations}
      onDelete={handleDeleteInstances}
      onWheel={closePopover}
    />
  )
}

export default DatabasesListWrapper
