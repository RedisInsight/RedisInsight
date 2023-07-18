import React, { useEffect, useState } from 'react'
import {
  EuiButton,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiResizableContainer,
  EuiToolTip,
} from '@elastic/eui'
import { isNull, find } from 'lodash'

import { useDispatch, useSelector } from 'react-redux'
import { useParams, useLocation, useHistory } from 'react-router-dom'
import cx from 'classnames'
import {
  fetchTriggeredFunctionsLibrariesList,
  setSelectedLibraryToShow,
  setTriggeredFunctionsSelectedLibrary,
  triggeredFunctionsLibrariesSelector,
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { isTriggeredAndFunctionsAvailable, Nullable } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { TriggeredFunctionsLibrary } from 'uiSrc/slices/interfaces/triggeredFunctions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import NoLibrariesScreen from 'uiSrc/pages/triggeredFunctions/components/NoLibrariesScreen'
import LibrariesList from './components/LibrariesList'
import LibraryDetails from './components/LibraryDetails'
import AddLibrary from './components/AddLibrary'

import styles from './styles.module.scss'

export const firstPanelId = 'libraries-left-panel'
export const secondPanelId = 'libraries-right-panel'
const NoLibrariesMessage: React.ReactNode = (<span data-testid="no-libraries-message">No Libraries found</span>)

interface HistoryState {
  shouldOpenAddPanel?: boolean
}

const LibrariesPage = () => {
  const { lastRefresh, loading, data: libraries, selected } = useSelector(triggeredFunctionsLibrariesSelector)
  const { modules } = useSelector(connectedInstanceSelector)
  const [items, setItems] = useState<TriggeredFunctionsLibrary[]>([])
  const [filterValue, setFilterValue] = useState<string>('')
  const [selectedRow, setSelectedRow] = useState<Nullable<string>>(null)
  const [isAddLibraryPanelOpen, setIsAddLibraryPanelOpen] = useState<boolean>(false)
  const [message, setMessage] = useState<React.ReactNode>(NoLibrariesMessage)

  const { instanceId } = useParams<{ instanceId: string }>()
  const { state } = useLocation<HistoryState>()
  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    if (isTriggeredAndFunctionsAvailable(modules)) {
      updateList()
    }
  }, [])

  useEffect(() => {
    if (state?.shouldOpenAddPanel) {
      onAddLibrary()
      history.replace({ ...history.location, state: undefined })
    }
  }, [state?.shouldOpenAddPanel])

  useEffect(() => {
    applyFiltering()
  }, [filterValue, libraries])

  useEffect(() => {
    if (libraries?.length) {
      setMessage(NoLibrariesMessage)
      return
    }
    if (isTriggeredAndFunctionsAvailable(modules)) {
      setMessage(
        <NoLibrariesScreen isModuleLoaded onAddLibrary={onAddLibrary} isAddLibraryPanelOpen={isAddLibraryPanelOpen} />
      )
      return
    }
    setMessage(<NoLibrariesScreen isModuleLoaded={false} />)
  }, [libraries, isAddLibraryPanelOpen, modules])

  const handleSuccessUpdateList = (data: TriggeredFunctionsLibrary[]) => {
    if (selectedRow) {
      const findRow = find(data, (item) => item.name === selectedRow)
      setSelectedRow(findRow?.name ?? null)
    }

    if (selected) {
      const findRow = find(data, (item) => item.name === selected)

      if (findRow) {
        setSelectedRow(selected)
      }

      dispatch(setSelectedLibraryToShow(null))
    }

    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARIES_RECEIVED,
      eventData: {
        databaseId: instanceId,
        total: data.length
      }
    })
  }

  const updateList = () => {
    dispatch(fetchTriggeredFunctionsLibrariesList(instanceId, handleSuccessUpdateList))
  }

  const onChangeFiltering = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value.toLowerCase())
  }

  const handleSelectRow = (name?: string) => {
    setIsAddLibraryPanelOpen(false)
    setSelectedRow(name ?? null)

    if (name !== selectedRow) {
      // clear prev value to get new one
      dispatch(setTriggeredFunctionsSelectedLibrary(null))
    }
  }

  const handleDelete = (name: string) => {
    if (name === selectedRow) {
      // clear selected library after delete
      setSelectedRow(null)
    }
  }

  const applyFiltering = () => {
    if (!filterValue) {
      setItems(libraries || [])
      return
    }

    const itemsTemp = libraries?.filter((item: TriggeredFunctionsLibrary) => (
      item.name?.toLowerCase().indexOf(filterValue) !== -1
      || item.user?.toLowerCase().indexOf(filterValue) !== -1
    ))

    setItems(itemsTemp || [])
  }

  const onAddLibrary = () => {
    setSelectedRow(null)
    setIsAddLibraryPanelOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LOAD_LIBRARY_CLICKED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const onCloseAddLibrary = () => {
    setIsAddLibraryPanelOpen(false)
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LOAD_LIBRARY_CANCELLED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const onAdded = (libraryName: string) => {
    setIsAddLibraryPanelOpen(false)
    setSelectedRow(libraryName)
  }

  const isRightPanelOpen = !isNull(selectedRow) || isAddLibraryPanelOpen

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
            <EuiFieldSearch
              isClearable
              placeholder="Search for Libraries"
              className="triggeredFunctions__search"
              onChange={onChangeFiltering}
              disabled={!isTriggeredAndFunctionsAvailable(modules)}
              aria-label="Search libraries"
              data-testid="search-libraries-list"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip
              position="bottom"
              anchorClassName="euiToolTip__btn-disabled"
              content={isTriggeredAndFunctionsAvailable(modules) ? null : 'Triggered Functions is not loaded in current database'}
            >
              <EuiButton
                fill
                size="s"
                color="secondary"
                onClick={onAddLibrary}
                disabled={!isTriggeredAndFunctionsAvailable(modules)}
                className={styles.addLibrary}
                data-testid="btn-add-library"
              >
                + Library
              </EuiButton>
            </EuiToolTip>
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
                    fullWidth: !isRightPanelOpen,
                    openedRightPanel: isRightPanelOpen,
                  }),
                }}
              >
                <div className="triggeredFunctions__panelWrapper">
                  {!libraries && loading && (
                    <div className={styles.loading} data-testid="loading-libraries">
                      <EuiLoadingSpinner size="xl" />
                    </div>
                  )}
                  <LibrariesList
                    items={items}
                    loading={loading}
                    onRefresh={updateList}
                    lastRefresh={lastRefresh}
                    selectedRow={selectedRow}
                    onSelectRow={handleSelectRow}
                    onDeleteRow={handleDelete}
                    message={message}
                    isRefreshDisabled={!isTriggeredAndFunctionsAvailable(modules)}
                  />
                </div>
              </EuiResizablePanel>
              <EuiResizableButton
                className={cx('triggeredFunctions__resizableButton', {
                  hidden: !isRightPanelOpen,
                })}
                data-test-subj="resize-btn-libraries"
              />
              <EuiResizablePanel
                id={secondPanelId}
                scrollable={false}
                initialSize={50}
                minSize="400px"
                paddingSize="none"
                wrapperProps={{
                  className: cx('triggeredFunctions__resizePanelRight', {
                    noVisible: !isRightPanelOpen
                  }),
                }}
              >
                <div className="triggeredFunctions__panelWrapper">
                  {selectedRow && (
                    <LibraryDetails
                      name={selectedRow}
                      onClose={handleSelectRow}
                      onDeleteRow={handleDelete}
                    />
                  )}
                  {isAddLibraryPanelOpen && (
                    <AddLibrary onClose={onCloseAddLibrary} onAdded={onAdded} />
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

export default LibrariesPage
