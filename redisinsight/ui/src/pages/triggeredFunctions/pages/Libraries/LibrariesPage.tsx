import React, { useEffect, useState } from 'react'
import { EuiButton, EuiFieldSearch, EuiFlexGroup, EuiFlexItem } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchTriggeredFunctionsLibrariesList,
  triggeredFunctionsSelector
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { TriggeredFunctionsLibrary } from 'uiSrc/slices/interfaces/triggeredFunctions'
import NoLibrariesScreen from './components/NoLibrariesScreen'
import LibrariesList from './components/LibrariesList'

import styles from './styles.module.scss'

const LibrariesPage = () => {
  const { lastRefresh, loading, libraries } = useSelector(triggeredFunctionsSelector)
  const [items, setItems] = useState<TriggeredFunctionsLibrary[]>([])
  const [filterValue, setFilterValue] = useState<string>('')

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

  if (!libraries) {
    return <></>
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
            {libraries?.length > 0 && (
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
        {(libraries?.length > 0) && (
          <LibrariesList
            items={items}
            loading={loading}
            onRefresh={updateList}
            lastRefresh={lastRefresh}
          />
        )}
        {libraries?.length === 0 && (
          <NoLibrariesScreen />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default LibrariesPage
