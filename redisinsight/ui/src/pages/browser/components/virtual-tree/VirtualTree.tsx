import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { debounce, get, set } from 'lodash'
import {
  TreeWalker,
  TreeWalkerValue,
  FixedSizeTree as Tree,
} from 'react-vtree'
import { EuiIcon, EuiLoadingSpinner, EuiProgress } from '@elastic/eui'
import { useDispatch } from 'react-redux'

import { bufferToString, Maybe, Nullable } from 'uiSrc/utils'
import { useDisposableWebworker } from 'uiSrc/services'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { DEFAULT_DELIMITER, DEFAULT_TREE_SORTING, KeyTypes, ModulesKeyTypes, SortOrder, Theme } from 'uiSrc/constants'
import KeyLightSVG from 'uiSrc/assets/img/sidebar/browser.svg'
import KeyDarkSVG from 'uiSrc/assets/img/sidebar/browser_active.svg'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'
import { fetchKeysMetadataTree } from 'uiSrc/slices/browser/keys'
import { GetKeyInfoResponse } from 'apiSrc/modules/browser/dto'

import { Node } from './components/Node'
import { NodeMeta, TreeData, TreeNode } from './interfaces'

import styles from './styles.module.scss'

export interface Props {
  items: IKeyPropTypes[]
  delimiter?: string
  loadingIcon?: string
  loading: boolean
  deleting: boolean
  sorting: Maybe<SortOrder>
  commonFilterType: Nullable<KeyTypes>
  statusSelected: Nullable<string>,
  statusOpen: OpenedNodes
  webworkerFn: (...args: any) => any
  onStatusOpen?: (name: string, value: boolean) => void
  onStatusSelected?: (key: RedisString) => void
  setConstructingTree: (status: boolean) => void
  onDeleteLeaf: (key: RedisResponseBuffer) => void
  onDeleteClicked: (type: KeyTypes | ModulesKeyTypes) => void
}

interface OpenedNodes {
  [key: string]: boolean
}

export const KEYS = 'keys'

const VirtualTree = (props: Props) => {
  const {
    items,
    delimiter = DEFAULT_DELIMITER,
    loadingIcon = 'empty',
    statusOpen = {},
    statusSelected,
    loading,
    deleting,
    sorting = DEFAULT_TREE_SORTING,
    commonFilterType,
    onStatusOpen,
    onStatusSelected,
    setConstructingTree,
    webworkerFn = () => {},
    onDeleteClicked,
    onDeleteLeaf,
  } = props

  const { theme } = useContext(ThemeContext)
  const [rerenderState, rerender] = useState({})
  const controller = useRef<Nullable<AbortController>>(null)
  const elements = useRef<any>({})
  const nodes = useRef<TreeNode[]>([])

  const { result, run: runWebworker } = useDisposableWebworker(webworkerFn)

  const dispatch = useDispatch()

  useEffect(() =>
    () => {
      nodes.current = []
      elements.current = {}
    }, [])

  // receive result from the "runWebworker"
  useEffect(() => {
    if (!result) {
      return
    }

    elements.current = {}
    nodes.current = result
    rerender({})
    setConstructingTree?.(false)
  }, [result])

  useEffect(() => {
    if (!items?.length) {
      nodes.current = []
      elements.current = {}
      rerender({})
      runWebworker?.({ items: [], delimiter, sorting })
      return
    }

    setConstructingTree(true)
    runWebworker?.({ items, delimiter, sorting })
  }, [items, delimiter])

  const handleUpdateSelected = useCallback((name: RedisString) => {
    onStatusSelected?.(name)
  }, [onStatusSelected])

  const handleUpdateOpen = useCallback((fullName: string, value: boolean) => {
    onStatusOpen?.(fullName, value)
  }, [onStatusOpen, nodes])

  const updateNodeByPath = (path: string, data: any) => {
    const paths = path.replaceAll('.', '.children.')

    const node = get(nodes.current, paths)
    const fullData = { ...node, ...data }

    if (node) {
      set(nodes.current, paths, fullData)
    }
  }

  const formatItem = useCallback((item: GetKeyInfoResponse) => ({
    ...item,
    nameString: bufferToString(item.name as string)
  }), [])

  const getMetadata = useCallback((
    itemsInit: any[] = []
  ): void => {
    dispatch(fetchKeysMetadataTree(
      itemsInit,
      commonFilterType,
      controller.current?.signal,
      (loadedItems) =>
        onSuccessFetchedMetadata(loadedItems),
      () => { rerender({}) }
    ))
  }, [commonFilterType])

  const onSuccessFetchedMetadata = (
    loadedItems: any[],
  ) => {
    const items = loadedItems.map(formatItem)

    items.forEach((item) => updateNodeByPath(item.path, item))

    rerender({})
  }

  const getMetadataDebounced = debounce(() => {
    const entries = Object.entries(elements.current)

    getMetadata(entries)

    elements.current = {}
  }, 100)

  const getMetadataNode = useCallback((nameBuffer: any, path: string) => {
    elements.current[path] = nameBuffer
    getMetadataDebounced()
  }, [])

  // This helper function constructs the object that will be sent back at the step
  // [2] during the treeWalker function work. Except for the mandatory `data`
  // field you can put any additional data here.
  const getNodeData = (
    node: TreeNode,
    nestingLevel: number,
  ): TreeWalkerValue<TreeData, NodeMeta> => ({
    data: {
      id: node.id.toString(),
      isLeaf: node.isLeaf,
      keyCount: node.keyCount,
      name: node.name,
      nameString: node.nameString,
      nameBuffer: node.nameBuffer,
      ttl: node.ttl,
      size: node.size,
      type: node.type,
      fullName: node.fullName,
      shortName: node.nameString?.split(delimiter).pop(),
      nestingLevel,
      deleting,
      path: node.path,
      getMetadata: getMetadataNode,
      onDeleteClicked,
      updateStatusSelected: handleUpdateSelected,
      updateStatusOpen: handleUpdateOpen,
      onDelete: onDeleteLeaf,
      leafIcon: theme === Theme.Dark ? KeyDarkSVG : KeyLightSVG,
      keyApproximate: node.keyApproximate,
      isSelected: !!node.isLeaf && statusSelected === node?.nameString,
      isOpenByDefault: statusOpen[node.fullName],
    },
    nestingLevel,
    node,
  })

  // The `treeWalker` function runs only on tree re-build which is performed
  // whenever the `treeWalker` prop is changed.
  const treeWalker = useCallback(
    function* treeWalker(): ReturnType<TreeWalker<TreeData, NodeMeta>> {
      // Step [1]: Define the root multiple nodes of our tree
      for (let i = 0; i < nodes.current.length; i++) {
        yield getNodeData(nodes.current[i], 0)
      }

      // Step [2]: Get the parent component back. It will be the object
      // the `getNodeData` function constructed, so you can read any data from it.
      while (true) {
        const parentMeta = yield

        for (let i = 0; i < parentMeta.node.children?.length; i++) {
          // Step [3]: Yielding all the children of the provided component. Then we
          // will return for the step [2] with the first children.
          yield getNodeData(
            parentMeta.node.children[i],
            parentMeta.nestingLevel + 1,
          )
        }
      }
    },
    [statusSelected, statusOpen, rerenderState],
  )

  return (
    <AutoSizer>
      {({ height, width }) => (
        <div data-testid="virtual-tree" style={{ position: 'relative' }}>
          { nodes.current.length > 0 && (
            <>
              {loading && (
                <EuiProgress
                  color="primary"
                  size="xs"
                  position="absolute"
                  className={styles.progress}
                  style={{ width }}
                  data-testid="progress-key-tree"
                />
              )}
              <Tree
                async
                height={height}
                width={width}
                itemSize={42}
                treeWalker={treeWalker}
                className={styles.customScroll}
              >
                {Node}
              </Tree>
            </>
          )}
          { nodes.current.length === 0 && loading && (
            <div className={styles.loadingContainer} style={{ width, height }} data-testid="virtual-tree-spinner">
              <div className={styles.loadingBody}>
                <EuiLoadingSpinner size="xl" className={styles.loadingSpinner} />
                <EuiIcon type={loadingIcon || 'empty'} className={styles.loadingIcon} />
              </div>
            </div>
          )}
        </div>
      )}
    </AutoSizer>
  )
}

export default VirtualTree
