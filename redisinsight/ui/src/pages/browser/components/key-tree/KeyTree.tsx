import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState, useTransition } from 'react'
import cx from 'classnames'
import { EuiResizableContainer } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { isEmpty } from 'lodash'

import {
  appContextBrowserTree,
  resetBrowserTree,
  appContextDbConfig,
  setBrowserTreeNodesOpen,
  setBrowserTreeSelectedLeaf
} from 'uiSrc/slices/app/context'
import { constructKeysToTree } from 'uiSrc/helpers'
import VirtualTree from 'uiSrc/components/virtual-tree'
import TreeViewSVG from 'uiSrc/assets/img/icons/treeview.svg'
import { KeysStoreData } from 'uiSrc/slices/interfaces/keys'
import { Nullable, bufferToString } from 'uiSrc/utils'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { KeyTypes } from 'uiSrc/constants'
import { GetKeyInfoResponse } from 'apiSrc/modules/browser/dto'
import KeyTreeDelimiter from './KeyTreeDelimiter'

import KeyList from '../key-list'
import styles from './styles.module.scss'

export interface Props {
  keysState: KeysStoreData
  loading: boolean
  commonFilterType: Nullable<KeyTypes>
  selectKey: ({ rowData }: { rowData: any }) => void
  loadMoreItems: (
    oldKeys: IKeyPropTypes[],
    { startIndex, stopIndex }: { startIndex: number, stopIndex: number },
  ) => void
  onDelete: () => void
}

export const firstPanelId = 'tree'
export const secondPanelId = 'keys'

const parseKeyNames = (keys: GetKeyInfoResponse[]) =>
  keys.map((item) =>
    ({ ...item, nameString: item.nameString ?? bufferToString(item.name) }))

const KeyTree = forwardRef((props: Props, ref) => {
  const { selectKey, loadMoreItems, loading, keysState, onDelete, commonFilterType } = props

  const firstPanelId = 'tree'
  const secondPanelId = 'keys'

  const { panelSizes, openNodes, selectedLeaf } = useSelector(appContextBrowserTree)
  const { treeViewDelimiter: delimiter = '' } = useSelector(appContextDbConfig)

  const [,startTransition] = useTransition()

  const [statusSelected, setStatusSelected] = useState(selectedLeaf)
  const [statusOpen, setStatusOpen] = useState(openNodes)
  const [sizes, setSizes] = useState(panelSizes)
  const [keyListState, setKeyListState] = useState<KeysStoreData>(keysState)
  const [constructingTree, setConstructingTree] = useState(false)
  const [selectDefaultLeaf, setSelectDefaultLeaf] = useState(isEmpty(selectedLeaf))
  const [items, setItems] = useState<IKeyPropTypes[]>(parseKeyNames(keysState.keys ?? []))

  const dispatch = useDispatch()

  useImperativeHandle(ref, () => ({
    handleLoadMoreItems(config: { startIndex: number; stopIndex: number }) {
      onLoadMoreItems(config)
    }
  }))

  useEffect(() => {
    updateKeysList()
  }, [])

  useEffect(() => {
    setStatusOpen(openNodes)
  }, [openNodes])

  useEffect(() => {
    setStatusSelected(selectedLeaf)
    updateKeysList(Object.values(selectedLeaf)?.[0])

    setSelectDefaultLeaf(isEmpty(selectedLeaf))
  }, [selectedLeaf])

  useEffect(() => {
    setItems(parseKeyNames(keysState.keys))

    if (keysState.keys?.length === 0) {
      updateSelectedKeys()
    }
  }, [keysState.keys])

  useEffect(() => {
    setItems(parseKeyNames(keysState.keys))
  }, [delimiter, keysState.lastRefreshTime])

  const onLoadMoreItems = (props: { startIndex: number, stopIndex: number }) => {
    const formattedAllKeys = parseKeyNames(keysState.keys)
    loadMoreItems?.(formattedAllKeys, props)
  }

  // select default leaf "Keys" after each change delimiter, filter or search
  const updateSelectedKeys = () => {
    dispatch(resetBrowserTree())

    setTimeout(() => {
      startTransition(() => {
        setStatusSelected({})
        setSelectDefaultLeaf(true)
      })
    }, 0)
  }

  const updateKeysList = (items:any = {}) => {
    startTransition(() => {
      const newState:KeysStoreData = {
        ...keyListState,
        keys: Object.values(items)
      }

      setKeyListState(newState)
    })
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
                      commonFilterType={commonFilterType}
                      selectKey={selectKey}
                      onDelete={onDelete}
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
})

export default KeyTree
