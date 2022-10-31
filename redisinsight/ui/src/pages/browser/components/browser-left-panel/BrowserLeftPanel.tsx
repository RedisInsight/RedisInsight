import React, { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  appContextBrowser,
  appContextSelector,
  setBrowserKeyListDataLoaded,
} from 'uiSrc/slices/app/context'
import {
  fetchKeys,
  fetchMoreKeys,
  keysDataSelector,
  keysSelector,
} from 'uiSrc/slices/browser/keys'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { redisearchDataSelector, redisearchSelector } from 'uiSrc/slices/browser/redisearch'

import KeyList from '../key-list'
import KeyTree from '../key-tree'
import KeysHeader from '../keys-header'

import styles from './styles.module.scss'

export interface Props {
  arePanelsCollapsed: boolean
  selectKey: ({ rowData }: { rowData: any }) => void
  panelsState: {
    handleAddKeyPanel: (value: boolean) => void
    handleBulkActionsPanel: (value: boolean) => void
    handleCreateIndexPanel: (value: boolean) => void
  }
}

const BrowserLeftPanel = (props: Props) => {
  const {
    selectKey,
    panelsState,
  } = props

  const {
    handleAddKeyPanel,
    handleBulkActionsPanel,
    handleCreateIndexPanel,
  } = panelsState

  const { instanceId } = useParams<{ instanceId: string }>()
  const patternKeysState = useSelector(keysDataSelector)
  const redisearchKeysState = useSelector(redisearchDataSelector)
  const { loading: redisearchLoading } = useSelector(redisearchSelector)
  const { loading: patternLoading, viewType, searchMode } = useSelector(keysSelector)
  const { keyList: { isDataLoaded } } = useSelector(appContextBrowser)
  const { contextInstanceId } = useSelector(appContextSelector)

  const keyListRef = useRef<any>()

  const dispatch = useDispatch()

  const keysState = searchMode === SearchMode.Pattern ? patternKeysState : redisearchKeysState
  const loading = searchMode === SearchMode.Pattern ? patternLoading : redisearchLoading

  useEffect(() => {
    if (!isDataLoaded || contextInstanceId !== instanceId) {
      loadKeys(viewType)
    }
  }, [])

  const loadKeys = useCallback((keyViewType: KeyViewType = KeyViewType.Browser) => {
    dispatch(setConnectedInstanceId(instanceId))

    dispatch(fetchKeys(
      searchMode,
      '0',
      keyViewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT,
      () => dispatch(setBrowserKeyListDataLoaded(true)),
      () => dispatch(setBrowserKeyListDataLoaded(false))
    ))
  }, [searchMode])

  const loadMoreItems = (
    oldKeys: IKeyPropTypes[],
    { startIndex, stopIndex }: { startIndex: number; stopIndex: number }
  ) => {
    if (keysState.nextCursor !== '0') {
      dispatch(fetchMoreKeys(
        searchMode,
        oldKeys,
        keysState.nextCursor,
        stopIndex - startIndex + 1
      ))
    }
  }

  const handleScanMoreClick = (config: { startIndex: number; stopIndex: number }) => {
    keyListRef.current?.handleLoadMoreItems?.(config)
  }

  return (
    <div className={styles.container}>
      <KeysHeader
        keysState={keysState}
        loading={loading}
        loadKeys={loadKeys}
        handleAddKeyPanel={handleAddKeyPanel}
        handleBulkActionsPanel={handleBulkActionsPanel}
        handleCreateIndexPanel={handleCreateIndexPanel}
        handleScanMoreClick={handleScanMoreClick}
        nextCursor={keysState.nextCursor}
      />
      {viewType === KeyViewType.Browser && (
        <KeyList
          hideFooter
          ref={keyListRef}
          keysState={keysState}
          loading={loading}
          loadMoreItems={loadMoreItems}
          selectKey={selectKey}
        />
      )}
      {viewType === KeyViewType.Tree && (
        <KeyTree
          ref={keyListRef}
          keysState={keysState}
          loading={loading}
          selectKey={selectKey}
          loadMoreItems={loadMoreItems}
        />
      )}
    </div>
  )
}

export default React.memo(BrowserLeftPanel)
