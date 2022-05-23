import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
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
const noItemsMessageString = 'There are no Consumers in the Group.'

interface IStreamEntry extends StreamEntryDto {
  editing: boolean
}

export interface Props {
  data: IStreamEntry[]
  columns: ITableColumn[]
  onEditConsumer: (consumerId:string, editing: boolean) => void
  onClosePopover: () => void
  onSelectConsumer: ({ rowData }: { rowData: any }) => void
  isFooterOpen?: boolean
}

const ConsumersView = (props: Props) => {
  const { data = [], columns = [], onClosePopover, onSelectConsumer, isFooterOpen } = props

  const { loading } = useSelector(streamGroupsSelector)
  const { name: key = '' } = useSelector(selectedKeyDataSelector) ?? { }

  const [consumers, setConsumers] = useState(data)
  const [sortedColumnName, setSortedColumnName] = useState<string>('name')
  const [sortedColumnOrder, setSortedColumnOrder] = useState<SortOrder>(SortOrder.DESC)

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)

    setConsumers(orderBy(consumers, 'name', order?.toLowerCase()))
  }

  return (
    <>
      <div
        className={cx(
          'key-details-table',
          'stream-consumers-container',
          styles.container,
          { footerOpened: isFooterOpen }
        )}
        data-test-id="stream-consumers-container"
      >
        <VirtualTable
          hideProgress
          onRowClick={onSelectConsumer}
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

export default ConsumersView
