import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiResizableContainer } from '@elastic/eui'

import { formatLongName, getDbIndex, isEqualBuffers, Nullable, setTitle } from 'uiSrc/utils'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import {
  sendPageViewTelemetry,
  TelemetryPageView,
} from 'uiSrc/telemetry'
import {
  fetchKeys,
  fetchMoreKeys,
  keysDataSelector,
  keysSelector,
  resetKeyInfo,
  selectedKeyDataSelector,
  setInitialStateByType,
  toggleBrowserFullScreen,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector, setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import {
  setBrowserKeyListDataLoaded,
  setBrowserSelectedKey,
  appContextSelector,
  appContextBrowser,
  setBrowserPanelSizes,
  setLastPageContext,
} from 'uiSrc/slices/app/context'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import { resetErrors } from 'uiSrc/slices/app/notifications'
import InstanceHeader from 'uiSrc/components/instance-header'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'

import KeyList from './components/key-list/KeyList'
import KeyTree from './components/key-tree'
import KeysHeader from './components/keys-header'
import BrowserRightPanel from './components/browser-right-panel'

import styles from './styles.module.scss'

const widthResponsiveSize = 1124
export const firstPanelId = 'keys'
export const secondPanelId = 'keyDetails'

const BrowserPage = () => {
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { name: connectedInstanceName, db } = useSelector(connectedInstanceSelector)
  const { contextInstanceId } = useSelector(appContextSelector)
  const {
    keyList: { selectedKey: selectedKeyContext, isDataLoaded },
    panelSizes,
    bulkActions: { opened: bulkActionOpenContext },
  } = useSelector(appContextBrowser)
  const keysState = useSelector(keysDataSelector)
  const { loading, viewType, isBrowserFullScreen } = useSelector(keysSelector)
  const { type } = useSelector(selectedKeyDataSelector) ?? { type: '', length: 0 }

  const [isPageViewSent, setIsPageViewSent] = useState(false)
  const [arePanelsCollapsed, setArePanelsCollapsed] = useState(false)
  const [selectedKey, setSelectedKey] = useState<Nullable<RedisResponseBuffer>>(selectedKeyContext)

  const [isAddKeyPanelOpen, setIsAddKeyPanelOpen] = useState(false)
  const [isBulkActionsPanelOpen, setIsBulkActionsPanelOpen] = useState(bulkActionOpenContext)
  const [isCreateIndexPanelOpen, setIsCreateIndexPanelOpen] = useState(false)

  const [sizes, setSizes] = useState(panelSizes)

  const selectedKeyRef = useRef<Nullable<RedisResponseBuffer>>(selectedKey)
  const prevSelectedType = useRef<string>(type)
  const keyListRef = useRef<any>()

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Browser`)

  useEffect(() => {
    dispatch(resetErrors())
    updateWindowDimensions()
    globalThis.addEventListener('resize', updateWindowDimensions)

    if (!isDataLoaded || contextInstanceId !== instanceId) {
      loadKeys(viewType)
    }

    // componentWillUnmount
    return () => {
      globalThis.removeEventListener('resize', updateWindowDimensions)
      setSizes((prevSizes: any) => {
        dispatch(setBrowserPanelSizes(prevSizes))
        return {}
      })
      dispatch(setBrowserSelectedKey(selectedKeyRef.current))
      dispatch(setLastPageContext('browser'))
    }
  }, [])

  useEffect(() => {
    selectedKeyRef.current = selectedKey
  }, [selectedKey])

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent && analyticsIdentified) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent, analyticsIdentified])

  const updateWindowDimensions = () => {
    setArePanelsCollapsed(globalThis.innerWidth < widthResponsiveSize)
  }

  const onPanelWidthChange = useCallback((newSizes: any) => {
    setSizes((prevSizes: any) => ({
      ...prevSizes,
      ...newSizes,
    }))
  }, [])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.BROWSER_PAGE,
      databaseId: instanceId
    })
    setIsPageViewSent(true)
  }

  const loadKeys = (keyViewType: KeyViewType = KeyViewType.Browser) => {
    dispatch(setConnectedInstanceId(instanceId))
    dispatch(fetchKeys(
      '0',
      keyViewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT,
      () => dispatch(setBrowserKeyListDataLoaded(true)),
      () => dispatch(setBrowserKeyListDataLoaded(false))
    ))
  }

  const handlePanel = (value: boolean, keyName?: RedisResponseBuffer) => {
    if (value && !isAddKeyPanelOpen && !isBulkActionsPanelOpen && !isCreateIndexPanelOpen) {
      dispatch(resetKeyInfo())
    }

    dispatch(toggleBrowserFullScreen(false))
    setSelectedKey(keyName ?? null)
    closeRightPanels()
  }

  const handleAddKeyPanel = useCallback((value: boolean, keyName?: RedisResponseBuffer) => {
    handlePanel(value, keyName)
    setIsAddKeyPanelOpen(value)
  }, [])

  const handleBulkActionsPanel = useCallback((value: boolean) => {
    handlePanel(value)
    setIsBulkActionsPanelOpen(value)
  }, [])

  const handleCreateIndexPanel = useCallback((value: boolean) => {
    handlePanel(value)
    setIsCreateIndexPanelOpen(value)
  }, [])

  const closeRightPanels = useCallback(() => {
    setIsAddKeyPanelOpen(false)
    setIsBulkActionsPanelOpen(false)
    setIsCreateIndexPanelOpen(false)
  }, [])

  const selectKey = ({ rowData }: { rowData: any }) => {
    if (!isEqualBuffers(rowData.name, selectedKey)) {
      dispatch(toggleBrowserFullScreen(false))

      dispatch(setInitialStateByType(prevSelectedType.current))
      setSelectedKey(rowData.name)
      closeRightPanels()
      prevSelectedType.current = rowData.type
    }
  }

  const loadMoreItems = (
    oldKeys: IKeyPropTypes[],
    { startIndex, stopIndex }: { startIndex: number; stopIndex: number }
  ) => {
    if (keysState.nextCursor !== '0') {
      dispatch(fetchMoreKeys(oldKeys, keysState.nextCursor, stopIndex - startIndex + 1))
    }
  }

  const handleScanMoreClick = (config: { startIndex: number; stopIndex: number }) => {
    keyListRef.current?.handleLoadMoreItems?.(config)
  }

  const isRightPanelOpen = selectedKey !== null || isAddKeyPanelOpen || isBulkActionsPanelOpen || isCreateIndexPanelOpen

  return (
    <div className={`browserPage ${styles.container}`}>
      <InstanceHeader />
      <div className={styles.main}>
        <div className={styles.resizableContainer}>
          <EuiResizableContainer onPanelWidthChange={onPanelWidthChange} style={{ height: '100%' }}>
            {(EuiResizablePanel, EuiResizableButton) => (
              <>
                <EuiResizablePanel
                  id={firstPanelId}
                  scrollable={false}
                  initialSize={sizes[firstPanelId] ?? 50}
                  minSize="550px"
                  paddingSize="none"
                  wrapperProps={{
                    className: cx(styles.resizePanelLeft, {
                      [styles.fullWidth]: arePanelsCollapsed || (isBrowserFullScreen && !isRightPanelOpen)
                    }),
                  }}
                >
                  <div className={styles.leftPanelContent}>
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
                </EuiResizablePanel>

                <EuiResizableButton
                  className={cx(styles.resizableButton, {
                    [styles.hidden]: arePanelsCollapsed || isBrowserFullScreen,
                  })}
                  data-test-subj="resize-btn-keyList-keyDetails"
                />

                <EuiResizablePanel
                  id={secondPanelId}
                  scrollable={false}
                  initialSize={sizes[secondPanelId] ?? 50}
                  minSize="550px"
                  paddingSize="none"
                  data-testid="key-details"
                  wrapperProps={{
                    className: cx(styles.resizePanelRight, {
                      [styles.noVisible]: isBrowserFullScreen && !isRightPanelOpen,
                      [styles.fullWidth]: arePanelsCollapsed || (isBrowserFullScreen && isRightPanelOpen),
                      [styles.keyDetails]: arePanelsCollapsed || (isBrowserFullScreen && isRightPanelOpen),
                      [styles.keyDetailsOpen]: isRightPanelOpen,
                    }),
                  }}
                >
                  <BrowserRightPanel
                    arePanelsCollapsed={arePanelsCollapsed}
                    setSelectedKey={setSelectedKey}
                    selectedKey={selectedKey}
                    panelsState={{
                      isAddKeyPanelOpen,
                      isCreateIndexPanelOpen,
                      isBulkActionsPanelOpen,
                      handleAddKeyPanel,
                      handleBulkActionsPanel,
                      handleCreateIndexPanel,
                      closeRightPanels
                    }}
                  />
                </EuiResizablePanel>
              </>
            )}
          </EuiResizableContainer>
        </div>
      </div>
    </div>
  )
}

export default BrowserPage
