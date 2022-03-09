import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { EuiResizableContainer, EuiSuperSelect, EuiSuperSelectOption } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import {
  appContextBrowserTree,
  setBrowserTreeNodesOpen,
  setBrowserTreeSelectedLeaf
} from 'uiSrc/slices/app/context'
import { constructKeysToTree } from 'uiSrc/helpers'
import VirtualTree from 'uiSrc/components/virtual-tree'
import { DEFAULT_SEPARATOR } from 'uiSrc/constants'
import { IKeyListPropTypes, } from 'uiSrc/constants/prop-types/keys'
import TreeViewSVG from 'uiSrc/assets/img/icons/treeview.svg'

import KeyList from '../key-list/KeyList'
import styles from './styles.module.scss'

export interface Props {
  keysState: IKeyListPropTypes
  loading: boolean
  selectKey: ({ rowData }: { rowData: any }) => void
  loadMoreItems: ({ startIndex, stopIndex }: { startIndex: number, stopIndex: number }) => void
  handleAddKeyPanel: (value: boolean) => void
}

export const firstPanelId = 'tree'
export const secondPanelId = 'keys'

const KeyTree = (props: Props) => {
  const { selectKey, loading, keysState } = props

  const firstPanelId = 'tree'
  const secondPanelId = 'keys'

  const { panelSizes, openNodes, selectedLeaf } = useSelector(appContextBrowserTree)

  const [statusSelected, setStatusSelected] = useState(selectedLeaf)
  const [statusOpen, setStatusOpen] = useState(openNodes)
  const [sizes, setSizes] = useState(panelSizes)
  const [separator, setSeparator] = useState<string>(DEFAULT_SEPARATOR)
  const [keyListState, setKeyListState] = useState<IKeyListPropTypes>(keysState)
  const [constructingTree, setConstructingTree] = useState(false)

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

  const options: EuiSuperSelectOption<string>[] = [{
    value: DEFAULT_SEPARATOR,
    inputDisplay: DEFAULT_SEPARATOR,
    'data-test-subj': 'separator-colon',
  }]

  const updateKeysList = (items:any = {}) => {
    const newState:IKeyListPropTypes = {
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

  const onChangeSeparator = (initValue: string) => {
    setSeparator(initValue)
  }

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
                  wrapperProps={{
                    className: cx(styles.resizablePanelLeft),
                  }}
                >
                  <div className={styles.tree}>
                    <EuiSuperSelect
                      disabled={loading}
                      options={options}
                      valueOfSelected={separator}
                      popoverClassName={styles.separatorSelect}
                      itemClassName={styles.separatorSelectItem}
                      onChange={(value: string) => onChangeSeparator(value)}
                      data-testid="select-tree-view-separator"
                    />
                    <VirtualTree
                      items={keysState.keys}
                      loadingIcon={TreeViewSVG}
                      separator={separator}
                      statusSelected={statusSelected}
                      statusOpen={statusOpen}
                      loading={loading || constructingTree}
                      setConstructingTree={setConstructingTree}
                      webworkerFn={constructKeysToTree}
                      onSelectLeaf={updateKeysList}
                      onStatusSelected={handleStatusSelected}
                      onStatusOpen={handleStatusOpen}
                    />
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
