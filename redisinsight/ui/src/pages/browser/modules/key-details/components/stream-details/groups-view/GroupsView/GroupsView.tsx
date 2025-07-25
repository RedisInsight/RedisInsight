import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { orderBy } from 'lodash'

import { streamGroupsSelector } from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { SortOrder } from 'uiSrc/constants'
import { ConsumerGroupDto } from 'uiSrc/api-client'
import { getLodashOrder } from 'uiSrc/utils'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 54
const noItemsMessageString = 'Your Key has no Consumer Groups available.'

export interface IConsumerGroup extends ConsumerGroupDto {
  editing: boolean
}

export interface Props {
  data: IConsumerGroup[]
  columns: ITableColumn[]
  onClosePopover: () => void
  onSelectGroup: ({ rowData }: { rowData: any }) => void
}

const ConsumerGroups = (props: Props) => {
  const { data = [], columns = [], onClosePopover, onSelectGroup } = props

  const { loading } = useSelector(streamGroupsSelector)
  const key = useSelector(selectedKeyDataSelector)?.name

  const [groups, setGroups] = useState<IConsumerGroup[]>([])
  const [sortedColumnName, setSortedColumnName] = useState<string>('name')
  const [sortedColumnOrder, setSortedColumnOrder] = useState<SortOrder>(
    SortOrder.ASC,
  )

  useEffect(() => {
    setGroups(
      orderBy(data, sortedColumnName, getLodashOrder(sortedColumnOrder)),
    )
  }, [data])

  const onChangeSorting = useCallback(
    (column: any, order: SortOrder) => {
      setSortedColumnName(column)
      setSortedColumnOrder(order)

      setGroups(
        orderBy(
          data,
          column === 'name' ? `${column}.viewValue` : column,
          getLodashOrder(order),
        ),
      )
    },
    [groups],
  )

  return (
    <>
      <div
        className={cx(
          'key-details-table',
          'stream-details-table',
          styles.container,
        )}
        data-testid="stream-groups-container"
      >
        <VirtualTable
          autoHeight
          hideProgress
          onRowClick={onSelectGroup}
          selectable={false}
          keyName={key}
          totalItemsCount={groups.length}
          headerHeight={groups?.length ? headerHeight : 0}
          rowHeight={rowHeight}
          columns={columns}
          footerHeight={0}
          loading={loading}
          items={groups}
          tableWidth={columns.reduce((a, b) => a + (b.minWidth ?? 0), 0)}
          onWheel={onClosePopover}
          onChangeSorting={onChangeSorting}
          noItemsMessage={noItemsMessageString}
          sortedColumn={
            groups?.length
              ? {
                  column: sortedColumnName,
                  order: sortedColumnOrder,
                }
              : undefined
          }
        />
      </div>
    </>
  )
}

export default ConsumerGroups
