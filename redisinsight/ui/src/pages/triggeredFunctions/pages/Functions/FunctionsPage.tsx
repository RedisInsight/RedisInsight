import React, { useEffect, useState } from 'react'
import { EuiFieldSearch, EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner, EuiResizableContainer, } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { find, pick } from 'lodash'
import {
  fetchTriggeredFunctionsFunctionsList,
  setSelectedFunctionToShow,
  triggeredFunctionsFunctionsSelector,
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { TriggeredFunctionsFunction } from 'uiSrc/slices/interfaces/triggeredFunctions'
import { Nullable } from 'uiSrc/utils'

import { LIST_OF_FUNCTION_NAMES } from 'uiSrc/pages/triggeredFunctions/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { getFunctionsLengthByType } from 'uiSrc/utils/triggered-functions/utils'
import FunctionsList from './components/FunctionsList'
import FunctionDetails from './components/FunctionDetails'

import styles from './styles.module.scss'

export const firstPanelId = 'functions-left-panel'
export const secondPanelId = 'functions-right-panel'

const FunctionsPage = () => {
  const { lastRefresh, loading, data: functions, selected } = useSelector(triggeredFunctionsFunctionsSelector)
  const [items, setItems] = useState<TriggeredFunctionsFunction[]>([])
  const [filterValue, setFilterValue] = useState<string>('')
  const [selectedRow, setSelectedRow] = useState<Nullable<TriggeredFunctionsFunction>>(null)

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  useEffect(() => {
    updateList()
  }, [])

  useEffect(() => {
    applyFiltering()
  }, [filterValue, functions])

  const updateList = () => {
    dispatch(fetchTriggeredFunctionsFunctionsList(instanceId, handleSuccessUpdateList))
  }

  const handleSuccessUpdateList = (data: TriggeredFunctionsFunction[]) => {
    if (selectedRow) {
      const pickFields = ['name', 'library', 'type']
      const findRow = find(data, pick(selectedRow, pickFields))
      setSelectedRow(findRow ?? null)
    }

    if (selected) {
      const findRow = find(data, selected)

      if (findRow) {
        setSelectedRow(findRow)
      }

      dispatch(setSelectedFunctionToShow(null))
    }

    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTIONS_RECEIVED,
      eventData: {
        databaseId: instanceId,
        functions: {
          total: data.length,
          ...getFunctionsLengthByType(data)
        }
      }
    })
  }

  const onChangeFiltering = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value.toLowerCase())
  }

  const handleSelectRow = (item?: TriggeredFunctionsFunction) => {
    setSelectedRow(item ?? null)
  }

  const applyFiltering = () => {
    if (!filterValue) {
      setItems(functions || [])
      return
    }

    const itemsTemp = functions?.filter((item: TriggeredFunctionsFunction) => (
      item.name?.toLowerCase().indexOf(filterValue) !== -1
      || item.library?.toLowerCase().indexOf(filterValue) !== -1
      || (item.type && LIST_OF_FUNCTION_NAMES[item.type].toLowerCase().indexOf(filterValue) !== -1)
    ))

    setItems(itemsTemp || [])
  }

  return (
    <EuiFlexGroup
      className={cx('triggeredFunctions__page', styles.main)}
      direction="column"
      gutterSize="none"
      responsive={false}
    >
      <EuiFlexItem grow={false}>
        <EuiFlexGroup
          alignItems="center"
          responsive={false}
          gutterSize="none"
          className="triggeredFunctions__topPanel"
        >
          <EuiFlexItem style={{ marginRight: 24 }}>
            {!!functions?.length && (
              <EuiFieldSearch
                isClearable
                placeholder="Search for Functions"
                className="triggeredFunctions__search"
                onChange={onChangeFiltering}
                aria-label="Search functions"
                data-testid="search-functions-list"
              />
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem className="triggeredFunctions__content">
        <EuiResizableContainer style={{ height: '100%' }}>
          {(EuiResizablePanel, EuiResizableButton) => (
            <>
              <EuiResizablePanel
                id={firstPanelId}
                scrollable={false}
                initialSize={50}
                minSize="550px"
                paddingSize="none"
                wrapperProps={{
                  className: cx('triggeredFunctions__resizePanelLeft', {
                    fullWidth: !selectedRow,
                    openedRightPanel: selectedRow,
                  }),
                }}
              >
                <div className="triggeredFunctions__panelWrapper">
                  {!functions && loading && (
                    <div className={styles.loading} data-testid="loading-functions">
                      <EuiLoadingSpinner size="xl" />
                    </div>
                  )}
                  {functions && (
                    <FunctionsList
                      items={items}
                      loading={loading}
                      onRefresh={updateList}
                      lastRefresh={lastRefresh}
                      selectedRow={selectedRow}
                      onSelectRow={handleSelectRow}
                    />
                  )}
                </div>
              </EuiResizablePanel>
              <EuiResizableButton
                className={cx('triggeredFunctions__resizableButton', {
                  hidden: !selectedRow,
                })}
                data-test-subj="resize-btn-functions"
              />
              <EuiResizablePanel
                id={secondPanelId}
                scrollable={false}
                initialSize={50}
                minSize="400px"
                paddingSize="none"
                wrapperProps={{
                  className: cx('triggeredFunctions__resizePanelRight', {
                    noVisible: !selectedRow
                  }),
                }}
              >
                <div className="triggeredFunctions__panelWrapper">
                  {selectedRow && (
                    <FunctionDetails item={selectedRow} onClose={() => setSelectedRow(null)} />
                  )}
                </div>
              </EuiResizablePanel>
            </>
          )}
        </EuiResizableContainer>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default FunctionsPage
