import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiProgress } from '@elastic/eui'
import { orderBy } from 'lodash'

import {
  streamGroupsSelector,
} from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { SortOrder } from 'uiSrc/constants'
import { StreamEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 54
const actionsWidth = 54
const minColumnWidth = 190
const noItemsMessageString = 'There are no Consumer Groups in the Stream.'

interface IStreamEntry extends StreamEntryDto {
  editing: boolean
}

export interface Props {
  data: IStreamEntry[]
  columns: ITableColumn[]
  onEditGroup: (groupId:string, editing: boolean) => void
  onClosePopover: () => void
  onSelectGroup: ({ rowData }: { rowData: any }) => void
  isFooterOpen?: boolean
}

const ConsumerGroups = (props: Props) => {
  const { data = [], columns = [], onClosePopover, onSelectGroup, isFooterOpen } = props

  const { loading } = useSelector(streamGroupsSelector)
  const { name: key = '' } = useSelector(selectedKeyDataSelector) ?? { }

  const [groups, setGroups] = useState(data)
  const [sortedColumnName, setSortedColumnName] = useState<string>('name')
  const [sortedColumnOrder, setSortedColumnOrder] = useState<SortOrder>(SortOrder.DESC)

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)

    setGroups(orderBy(groups, 'name', order?.toLowerCase()))
  }

  return (
    <>
      <div
        className={cx(
          'key-details-table',
          'stream-groups-container',
          styles.container,
          { footerOpened: isFooterOpen }
        )}
        data-test-id="stream-groups-container"
      >
        <VirtualTable
          hideProgress
          onRowClick={onSelectGroup}
          selectable={false}
          keyName={key}
          totalItemsCount={data.length}
          headerHeight={data?.length ? headerHeight : 0}
          rowHeight={rowHeight}
          columns={columns}
          footerHeight={0}
          loading={loading}
          items={data}
          onWheel={onClosePopover}
          onChangeSorting={onChangeSorting}
          noItemsMessage={noItemsMessageString}
          sortedColumn={data?.length ? {
            column: sortedColumnName,
            order: sortedColumnOrder,
          } : undefined}
        />
      </div>
    </>
  )
}

export default ConsumerGroups
