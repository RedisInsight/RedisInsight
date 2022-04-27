import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { EuiResizableContainer } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import {
  appContextBrowserTree,
  setBrowserTreeNodesOpen,
  setBrowserTreeSelectedLeaf
} from 'uiSrc/slices/app/context'
import { constructKeysToTree } from 'uiSrc/helpers'
import { keysSelector } from 'uiSrc/slices/keys'
import VirtualTree from 'uiSrc/components/virtual-tree'
import TreeViewSVG from 'uiSrc/assets/img/icons/treeview.svg'
import { KeysStoreData } from 'uiSrc/slices/interfaces/keys'
import KeyTreeDelimiter from './KeyTreeDelimiter'

import KeyList from '../key-list/KeyList'
import styles from './styles.module.scss'

export interface Props {
  keysState: KeysStoreData
  loading: boolean
  selectKey: ({ rowData }: { rowData: any }) => void
}

export const firstPanelId = 'tree'
export const secondPanelId = 'keys'

const KeyTree = (props: Props) => {
  const { selectKey, loading, keysState } = props

  const firstPanelId = 'tree'
  const secondPanelId = 'keys'

  const { filter, search } = useSelector(keysSelector)
  const { delimiter, panelSizes, openNodes, selectedLeaf } = useSelector(appContextBrowserTree)

  const [statusSelected, setStatusSelected] = useState(selectedLeaf)
  const [statusOpen, setStatusOpen] = useState(openNodes)
  const [sizes, setSizes] = useState(panelSizes)
  const [keyListState, setKeyListState] = useState<KeysStoreData>(keysState)
  const [constructingTree, setConstructingTree] = useState(false)
  const [selectDefaultLeaf, setSelectDefaultLeaf] = useState(true)
  const [items, setItems] = useState(keysState.keys ?? [])

  const dispatch = useDispatch()

  useEffect(() => {
    updateKeysList()
  }, [])

  useEffect(() => {
    setStatusOpen(openNodes)
  }, [openNodes])

  useEffect(() => {
    if (selectedLeaf) {
      setStatusSelected(selectedLeaf)
      updateKeysList(Object.values(selectedLeaf)[0])
    }
  }, [selectedLeaf])

  useEffect(() => {
    setItems(keysState.keys)
    if (keysState.keys?.length === 0) {
      dispatch(setBrowserTreeSelectedLeaf({}))
    }
  }, [keysState.keys])

  useEffect(() => {
    updateSelectedKeys()
  }, [delimiter, filter, search, keysState.lastRefreshTime])

  // select default leaf "Keys" after each change delimiter, filter or search
  const updateSelectedKeys = () => {
    setItems([])
    setTimeout(() => {
      setStatusSelected({})
      setSelectDefaultLeaf(true)
      setItems(keysState.keys)
    }, 0)
  }

  const updateKeysList = (items:any = {}) => {
    const newState:KeysStoreData = {
      ...keyListState,
      keys: Object.values(items)
    }

    setKeyListState(newState)
  }

  const onPanelWidthChange = useCallback((newSizes: any) => {
    setSizes((prevSizes: any) => ({
      ...prevSizes,
      ...newSizes,
    }))
  }, [])

  const handleStatusOpen = (name: string, value:boolean) => {
    setStatusOpen((prevState) => {
      const newState = { ...prevState }
      // add or remove opened node
      if (newState[name]) {
        delete newState[name]
      } else {
        newState[name] = value
      }

      dispatch(setBrowserTreeNodesOpen(newState))
      return newState
    })
  }

  const handleStatusSelected = (fullName: string, keys: any) => {
    dispatch(setBrowserTreeSelectedLeaf({ [fullName]: keys }))
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.body}>
          <EuiResizableContainer onPanelWidthChange={onPanelWidthChange} style={{ height: '100%' }}>
            {(EuiResizablePanel, EuiResizableButton) => (
              <>
                <EuiResizablePanel
                  id={firstPanelId}
                  scrollable={false}
                  initialSize={sizes[firstPanelId] ?? 30}
                  minSize="100px"
                  paddingSize="none"
                  data-test-subj="tree-view-panel"
                  wrapperProps={{
                    className: cx(styles.resizablePanelLeft),
                  }}
                >
                  <div className={styles.tree}>
                    <div className={styles.treeHeader}>
                      <KeyTreeDelimiter loading={loading} />
                    </div>
                    <div className={styles.treeContent}>
                      <VirtualTree
                        items={items}
                        loadingIcon={TreeViewSVG}
                        delimiter={delimiter}
                        statusSelected={statusSelected}
                        statusOpen={statusOpen}
                        loading={loading || constructingTree}
                        setConstructingTree={setConstructingTree}
                        webworkerFn={constructKeysToTree}
                        onSelectLeaf={updateKeysList}
                        onStatusSelected={handleStatusSelected}
                        onStatusOpen={handleStatusOpen}
                        selectDefaultLeaf={selectDefaultLeaf}
                        disableSelectDefaultLeaf={() => setSelectDefaultLeaf(false)}
                      />
                    </div>
                  </div>
                </EuiResizablePanel>

                <EuiResizableButton
                  className={cx(styles.resizableButton)}
                  data-test-subj="resize-btn-keyList-keyDetails"
                />

                <EuiResizablePanel
                  id={secondPanelId}
                  scrollable={false}
                  initialSize={sizes[secondPanelId] ?? 70}
                  minSize="400px"
                  paddingSize="none"
                  data-test-subj="key-list-panel"
                  wrapperProps={{
                    className: cx(styles.resizablePanelRight),
                  }}
                >
                  <div className={styles.list}>
                    <KeyList
                      hideHeader
                      hideFooter
                      keysState={keyListState}
                      loading={loading || constructingTree}
                      selectKey={selectKey}
                    />
                  </div>
                </EuiResizablePanel>
              </>
            )}
          </EuiResizableContainer>

        </div>
      </div>
    </div>
  )
}

export default KeyTree
