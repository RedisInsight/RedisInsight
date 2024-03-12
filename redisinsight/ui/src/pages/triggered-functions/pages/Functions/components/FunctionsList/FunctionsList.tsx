import React, { useState } from 'react'
import { EuiBasicTableColumn, EuiInMemoryTable, EuiText, EuiToolTip, PropertySort } from '@elastic/eui'
import cx from 'classnames'

import { useParams } from 'react-router-dom'
import { isEqual, pick } from 'lodash'
import { Maybe, Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FunctionType, TriggeredFunctionsFunction } from 'uiSrc/slices/interfaces/triggeredFunctions'
import { LIST_OF_FUNCTION_NAMES } from 'uiSrc/pages/triggered-functions/constants'
import { AutoRefresh } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  items: Nullable<TriggeredFunctionsFunction[]>
  loading: boolean
  onRefresh: () => void
  lastRefresh: Nullable<number>
  selectedRow: Nullable<TriggeredFunctionsFunction>
  onSelectRow: (item: TriggeredFunctionsFunction) => void
  message: React.ReactNode
  isRefreshDisabled: boolean
}

const FunctionsList = (props: Props) => {
  const { items, loading, onRefresh, lastRefresh, selectedRow, onSelectRow, message, isRefreshDisabled } = props
  const [sort, setSort] = useState<Maybe<PropertySort>>(undefined)

  const { instanceId } = useParams<{ instanceId: string }>()

  const columns: EuiBasicTableColumn<any>[] = [
    {
      name: 'Function Name',
      field: 'name',
      sortable: true,
      truncateText: true,
      width: '25%',
      render: (value: string) => (
        <EuiToolTip title="Function Name" content={value}><>{value}</></EuiToolTip>
      )
    },
    {
      name: 'Library',
      field: 'library',
      sortable: true,
      truncateText: true,
      width: '25%',
      render: (value: string) => (
        <EuiToolTip title="Library Name" content={value}><>{value}</></EuiToolTip>
      )
    },
    {
      name: 'Type',
      field: 'type',
      sortable: true,
      width: '50%',
      render: (value: string) => LIST_OF_FUNCTION_NAMES[value as FunctionType]
    },
  ]

  const handleSelect = (item: TriggeredFunctionsFunction) => {
    onSelectRow(item)
  }

  const handleRefreshClicked = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_LIST_REFRESH_CLICKED,
      eventData: {
        databaseId: instanceId
      }
    })
  }

  const handleSorting = ({ sort }: any) => {
    setSort(sort)
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTIONS_SORTED,
      eventData: {
        ...sort,
        databaseId: instanceId
      }
    })
  }

  const handleEnableAutoRefresh = (enableAutoRefresh: boolean, refreshRate: string) => {
    sendEventTelemetry({
      event: enableAutoRefresh
        ? TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_LIST_AUTO_REFRESH_ENABLED
        : TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_LIST_AUTO_REFRESH_DISABLED,
      eventData: {
        refreshRate,
        databaseId: instanceId
      }
    })
  }

  const isRowSelected = (row: TriggeredFunctionsFunction, selectedRow: Nullable<TriggeredFunctionsFunction>) => {
    const pickFields = ['name', 'library', 'type']
    return selectedRow && isEqual(pick(row, pickFields), pick(selectedRow, pickFields))
  }

  return (
    <div className="triggeredFunctions__tableWrapper">
      <div className="triggeredFunctions__tableHeader">
        <EuiText color="subdued" size="xs" data-testid="total-functions">Total: {items?.length || 0}</EuiText>
        <AutoRefresh
          loading={loading}
          postfix="triggered-functions-functions"
          displayText
          lastRefreshTime={lastRefresh}
          containerClassName={styles.refreshContainer}
          onRefresh={() => onRefresh?.()}
          onRefreshClicked={handleRefreshClicked}
          onEnableAutoRefresh={handleEnableAutoRefresh}
          disabled={isRefreshDisabled}
          testid="refresh-functions-btn"
        />
      </div>
      <EuiInMemoryTable
        loading={loading}
        items={items ?? []}
        columns={columns}
        sorting={sort ? ({ sort }) : true}
        responsive={false}
        rowProps={(row) => ({
          onClick: () => handleSelect(row),
          className: isRowSelected(row, selectedRow) ? 'selected' : '',
          'data-testid': `row-${row.name}`,
        })}
        message={message}
        onTableChange={handleSorting}
        className={cx(
          'inMemoryTableDefault',
          'noBorders',
          'triggeredFunctions__table',
          { triggeredFunctions__emptyTable: !items?.length }
        )}
        data-testid="functions-list-table"
      />
    </div>
  )
}

export default FunctionsList
