import { Criteria, EuiButtonIcon, EuiTableFieldDataColumnType, EuiText, EuiToolTip, PropertySort } from '@elastic/eui'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'

import ItemList from 'uiSrc/components/item-list'
import { BrowserStorageItem, Pages } from 'uiSrc/constants'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { localStorageService } from 'uiSrc/services'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { deleteInstancesAction, instancesSelector } from 'uiSrc/slices/rdi/instances'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { Nullable, formatLongName, lastConnectionFormat } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  width: number
  dialogIsOpen: boolean
  editedInstance: Nullable<RdiInstance>
  onEditInstance: (instance: RdiInstance) => void
  onDeleteInstances: (instances: RdiInstance[]) => void
}

const suffix = '_rdi_instance'

const RdiInstancesListWrapper = ({ width, dialogIsOpen, onEditInstance, editedInstance, onDeleteInstances }: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search } = useLocation()

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
      const instance = instances.data.find((item: RdiInstance) => item.id === editInstanceId)
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

  const handleCopy = (text = '', id: string) => {
    navigator.clipboard?.writeText(text)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_RDI_INSTANCES_URL_COPIED,
      eventData: {
        id
      }
    })
  }

  const handleClickDeleteInstance = (id: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_RDI_INSTANCES_SINGLE_DELETE_CLICKED,
      eventData: {
        id
      }
    })
    showPopover(id)
  }

  const handleClickEditInstance = (instance: RdiInstance) => {
    onEditInstance(instance)
  }

  const handleDeleteInstance = (instance: RdiInstance) => {
    dispatch(deleteInstancesAction([instance], () => onDeleteInstances([instance])))
  }

  const handleDeleteInstances = (instances: RdiInstance[]) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_RDI_INSTANCES_MULTIPLE_DELETE_CLICKED,
      eventData: {
        ids: instances.map((instance) => instance.id)
      }
    })
    dispatch(deleteInstancesAction(instances, () => onDeleteInstances(instances)))
  }

  const handleExportInstances = () => {}

  const columnsFull: EuiTableFieldDataColumnType<RdiInstance>[] = [
    {
      field: 'name',
      className: 'column_name',
      name: 'RDI Alias',
      dataType: 'string',
      truncateText: true,
      'data-test-subj': 'rdi-alias-column',
      sortable: ({ name }) => name?.toLowerCase(),
      width: '30%'
    },
    {
      field: 'url',
      className: 'column_url',
      name: 'URL',
      width: '35%',
      dataType: 'string',
      truncateText: true,
      sortable: ({ url }) => url?.toLowerCase(),
      render: (name: string, { id }) => (
        <div className="url" data-testid="url">
          <EuiText className="copyUrlText">{name}</EuiText>
          <EuiToolTip position="right" content="Copy" anchorClassName="copyUrlTooltip">
            <EuiButtonIcon
              iconType="copy"
              aria-label="Copy URL"
              className="copyUrlBtn"
              onClick={() => handleCopy(name, id)}
            />
          </EuiToolTip>
        </div>
      )
    },
    {
      field: 'version',
      className: 'column_type',
      name: 'RDI Version',
      dataType: 'string',
      sortable: true,
      width: '100px'
    },
    {
      field: 'lastConnection',
      className: 'column_lastConnection',
      name: 'Last connection',
      dataType: 'date',
      align: 'right',
      width: '170px',
      sortable: ({ lastConnection }) => (lastConnection ? -new Date(`${lastConnection}`) : -Infinity),
      render: (date: Date) => lastConnectionFormat(date)
    },
    {
      field: 'controls',
      className: 'column_controls',
      width: '120px',
      name: '',
      render: (_act: any, instance: RdiInstance) => (
        <>
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
    }
  ]

  const columnsHideForTablet = ['']
  const columnsHideForEditing = ['']
  const columnsTablet = columnsFull.filter(({ field = '' }) => columnsHideForTablet.indexOf(field) === -1)
  const columnsEditing = columnsFull.filter(({ field }) => columnsHideForEditing.indexOf(field) === -1)

  const columnVariations = [columnsFull, columnsEditing, columnsTablet]

  const onTableChange = ({ sort, page }: Criteria<RdiInstance>) => {
    // calls also with page changing
    if (sort && !page) {
      localStorageService.set(BrowserStorageItem.rdiInstancesSorting, sort)
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_RDI_INSTANCES_LIST_SORTED,
        eventData: sort
      })
    }
  }

  const sort: PropertySort = localStorageService.get(BrowserStorageItem.rdiInstancesSorting) ?? {
    field: 'lastConnection',
    direction: 'asc'
  }

  return (
    <div className={styles.container}>
      <ItemList<RdiInstance>
        width={width}
        editedInstance={editedInstance}
        dialogIsOpen={dialogIsOpen}
        columnVariations={columnVariations}
        onDelete={handleDeleteInstances}
        onExport={handleExportInstances}
        onWheel={closePopover}
        loading={instances.loading}
        data={instances.data}
        onTableChange={onTableChange}
        sort={sort}
      />
    </div>
  )
}

export default RdiInstancesListWrapper
