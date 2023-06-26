import React, { useEffect, useState } from 'react'
import {
  EuiButton,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiResizableContainer,
} from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  fetchTriggeredFunctionsLibrariesList,
  setTriggeredFunctionsSelectedLibrary,
  triggeredFunctionsSelector
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { TriggeredFunctionsLibrary } from 'uiSrc/slices/interfaces/triggeredFunctions'
import { Nullable } from 'uiSrc/utils'
import NoLibrariesScreen from './components/NoLibrariesScreen'
import LibrariesList from './components/LibrariesList'
import LibraryDetails from './components/LibraryDetails'

import styles from './styles.module.scss'

export const firstPanelId = 'libraries-left-panel'
export const secondPanelId = 'libraries-right-panel'

const LibrariesPage = () => {
  const { lastRefresh, loading, libraries } = useSelector(triggeredFunctionsSelector)
  const [items, setItems] = useState<TriggeredFunctionsLibrary[]>([])
  const [filterValue, setFilterValue] = useState<string>('')
  const [selectedRow, setSelectedRow] = useState<Nullable<string>>(null)

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  useEffect(() => {
    updateList()
  }, [])

  useEffect(() => {
    applyFiltering()
  }, [filterValue, libraries])

  const updateList = () => {
    dispatch(fetchTriggeredFunctionsLibrariesList(instanceId))
  }

  const onChangeFiltering = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value.toLowerCase())
  }

  const handleSelectRow = (name?: string) => {
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

  return (
    <EuiFlexGroup direction="column" style={{ height: '100%' }} gutterSize="none" responsive={false}>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup
          alignItems="center"
          responsive={false}
          gutterSize="none"
          className={styles.topPanel}
        >
          <EuiFlexItem style={{ marginRight: 24 }}>
            {!!libraries?.length && (
              <EuiFieldSearch
                isClearable
                placeholder="Search for Libraries"
                className={styles.search}
                onChange={onChangeFiltering}
                aria-label="Search libraries"
                data-testid="search-libraries-list"
              />
            )}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
              color="secondary"
              onClick={() => {}}
              className={styles.addLibrary}
              data-testid="btn-add-library"
            >
              + Library
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

      </EuiFlexItem>
      <EuiFlexItem className={styles.main}>
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
                  className: cx(styles.resizePanelLeft, {
                    [styles.fullWidth]: !selectedRow,
                    [styles.withSelectedRow]: selectedRow,
                  }),
                }}
              >
                <div className={styles.panelWrapper}>
                  {!libraries && loading && (
                    <div className={styles.loading} data-testid="loading-libraries">
                      <EuiLoadingSpinner size="xl" />
                    </div>
                  )}
                  {!!libraries?.length && (
                    <LibrariesList
                      items={items}
                      loading={loading}
                      onRefresh={updateList}
                      lastRefresh={lastRefresh}
                      selectedRow={selectedRow}
                      onSelectRow={handleSelectRow}
                      onDeleteRow={handleDelete}
                    />
                  )}
                  {libraries?.length === 0 && (
                    <NoLibrariesScreen />
                  )}
                </div>
              </EuiResizablePanel>
              <EuiResizableButton
                className={cx(styles.resizableButton, {
                  [styles.hidden]: !selectedRow,
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
                  className: cx(styles.resizePanelRight, {
                    [styles.noVisible]: !selectedRow
                  }),
                }}
              >
                <div className={styles.panelWrapper}>
                  {selectedRow && (
                    <LibraryDetails
                      name={selectedRow}
                      onClose={handleSelectRow}
                      onDeleteRow={handleDelete}
                    />
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
