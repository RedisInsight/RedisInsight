import { EuiText, EuiToolTip } from '@elastic/eui'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { DurationUnits, SortOrder, TableCellAlignment, TableCellTextAlignment } from 'uiSrc/constants'
import { convertNumberByUnits } from 'uiSrc/pages/slowLog/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Nullable } from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'

import styles from '../styles.module.scss'

export const DATE_FORMAT = 'HH:mm:ss d LLL yyyy'

export interface Props {
  items: any
  loading: boolean
  durationUnit: Nullable<DurationUnits>
}

const sortByTimeStamp = (items = [], order: SortOrder) =>
  [...items].sort((a: any, b: any) => (order === SortOrder.DESC ? b.time - a.time : a.time - b.time))

const SlowLogTable = (props: Props) => {
  const { items = [], loading = false, durationUnit } = props
  const [table, setTable] = useState<any>([])
  const [sortedColumnName, setSortedColumnName] = useState('time')
  const [sortedColumnOrder, setSortedColumnOrder] = useState(SortOrder.DESC)

  const { instanceId } = useParams<{ instanceId: string }>()
  const sortedColumn = {
    column: sortedColumnName,
    order: sortedColumnOrder,
  }

  useEffect(() => {
    setTable(sortByTimeStamp(items, sortedColumnOrder))
  }, [items, sortedColumnOrder])

  const columns: ITableColumn[] = [
    {
      id: 'time',
      label: 'Timestamp',
      absoluteWidth: 190,
      minWidth: 190,
      isSortable: true,
      render: (timestamp) => <EuiText size="s" color="subdued">{format(timestamp * 1000, DATE_FORMAT)}</EuiText>
    },
    {
      id: 'durationUs',
      label: `Duration, ${durationUnit}`,
      minWidth: 110,
      absoluteWidth: 'auto',
      textAlignment: TableCellTextAlignment.Right,
      alignment: TableCellAlignment.Right,
      render: (duration) => <EuiText size="s" color="subdued">{numberWithSpaces(convertNumberByUnits(duration, durationUnit))}</EuiText>
    },
    {
      id: 'args',
      label: 'Command',
      absoluteWidth: 'auto',
      render: (command) => (
        <EuiToolTip
          position="bottom"
          content={command}
          anchorClassName={styles.commandTooltip}
        >
          <span className={styles.commandText}>{command}</span>
        </EuiToolTip>
      )
    },
  ]

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)
    sendEventTelemetry({
      event: TelemetryEvent.SLOWLOG_SORTED,
      eventData: {
        databaseId: instanceId,
        timestamp: order
      }
    })
  }

  return (
    <div className={styles.tableWrapper} data-testid="slowlog-table">
      <VirtualTable
        selectable={false}
        loading={loading}
        items={table}
        columns={columns}
        sortedColumn={sortedColumn}
        onChangeSorting={onChangeSorting}
        hideFooter
      />
    </div>
  )
}

export default SlowLogTable
