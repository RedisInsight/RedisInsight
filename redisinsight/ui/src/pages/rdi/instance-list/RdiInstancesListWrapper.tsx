import { EuiButtonIcon, EuiImage, EuiSpacer, EuiTableFieldDataColumnType, EuiText, EuiToolTip } from '@elastic/eui'
import { saveAs } from 'file-saver'
import { map } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'

import EmptyListIcon from 'uiSrc/assets/img/empty_list.svg'
import ItemList from 'uiSrc/components/item-list'
import { BrowserStorageItem, Pages } from 'uiSrc/constants'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { deleteInstancesAction, exportInstancesAction, instancesSelector } from 'uiSrc/slices/rdi/instances'
import { TelemetryEvent } from 'uiSrc/telemetry'
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

  const handleCopy = (text = '') => {
    navigator.clipboard?.writeText(text)
  }

  const handleClickDeleteInstance = (id: string) => {
    showPopover(id)
  }

  const handleClickEditInstance = (instance: RdiInstance) => {
    onEditInstance(instance)
  }

  const handleDeleteInstance = (instance: RdiInstance) => {
    dispatch(deleteInstancesAction([instance], () => onDeleteInstances([instance])))
  }

  const handleDeleteInstances = (instances: RdiInstance[]) => {
    dispatch(deleteInstancesAction(instances, () => onDeleteInstances(instances)))
  }

  const handleExportInstances = (instances: RdiInstance[], withSecrets: boolean) => {
    const ids = map(instances, 'id')

    dispatch(
      exportInstancesAction(
        ids,
        withSecrets,
        (data) => {
          const file = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain;charset=utf-8' })
          saveAs(file, `RedisInsight_rdi_instances_${Date.now()}.json`)
        },
        () => {},
      ),
    )
  }

  const columnsFull: EuiTableFieldDataColumnType<RdiInstance>[] = [
    {
      field: 'name',
      className: 'column_name',
      name: 'RDI Alias',
      dataType: 'string',
      truncateText: true,
      'data-test-subj': 'rdi-alias-column',
      sortable: ({ name }) => name?.toLowerCase(),
      width: '30%',
    },
    {
      field: 'url',
      className: 'column_url',
      name: 'URL',
      width: '35%',
      dataType: 'string',
      truncateText: true,
      sortable: ({ url }) => url?.toLowerCase(),
      render: (name: string) => (
        <div className="url" data-testid="url">
          <EuiText className="copyUrlText">{name}</EuiText>
          <EuiToolTip position="right" content="Copy" anchorClassName="copyUrlTooltip">
            <EuiButtonIcon
              iconType="copy"
              aria-label="Copy URL"
              className="copyUrlBtn"
              onClick={() => handleCopy(name)}
            />
          </EuiToolTip>
        </div>
      ),
    },
    {
      field: 'version',
      className: 'column_type',
      name: 'RDI Version',
      dataType: 'string',
      sortable: true,
      width: '170px',
    },
    {
      field: 'lastConnection',
      className: 'column_lastConnection',
      name: 'Last connection',
      dataType: 'date',
      align: 'right',
      width: '170px',
      sortable: ({ lastConnection }) => (lastConnection ? -new Date(`${lastConnection}`) : -Infinity),
      render: (date: Date) => lastConnectionFormat(date),
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
      ),
    },
  ]

  const columnsHideForTablet = ['']
  const columnsHideForEditing = ['']
  const columnsTablet = columnsFull.filter(({ field = '' }) => columnsHideForTablet.indexOf(field) === -1)
  const columnsEditing = columnsFull.filter(({ field }) => columnsHideForEditing.indexOf(field) === -1)

  const columnVariations = [columnsFull, columnsEditing, columnsTablet]

  const telemetryEvents = {
    exportClicked: TelemetryEvent.CONFIG_RDI_INSTANCES_EXPORT_CLICKED,
    listSorted: TelemetryEvent.CONFIG_RDI_INSTANCES_LIST_SORTED,
    multipleDeleteClicked: TelemetryEvent.CONFIG_RDI_INSTANCES_MULTIPLE_DELETE_CLICKED,
  }

  const browserStorageItems = {
    sort: BrowserStorageItem.rdiInstancesSorting,
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
        browserStorageItems={browserStorageItems}
        telemetryEvents={telemetryEvents}
        emptyMessage={(
          <div className={styles.noResults}>
            <EuiImage src={EmptyListIcon} alt="empty" size="m" />
            <EuiSpacer size="xl" />
            <div>No deployments found</div>
            <div className={styles.tableMsgSubTitle}>Add your first deployment to get started!</div>
          </div>
        )}
      />
    </div>
  )
}

export default RdiInstancesListWrapper
