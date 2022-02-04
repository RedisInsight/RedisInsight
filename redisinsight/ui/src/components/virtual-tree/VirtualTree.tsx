import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import AutoSizer from 'react-virtualized-auto-sizer'
import {
  FixedSizeNodeData,
  FixedSizeTree as Tree,
  TreeWalkerValue,
} from 'react-vtree'
import { ListChildComponentProps } from 'react-window'

import { useDisposableWebworker, useWebworker } from 'uiSrc/services'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { useDispatch } from 'react-redux'
import { NodeComponentProps, NodePublicState } from 'react-vtree/dist/es/Tree'
import { constructTree } from './utils'

import styles from './styles.module.scss'

interface Props {
  items: IKeyPropTypes[]
  separator?: string
  webworkerFn: (...args: any) => any
  onSelectLeaf?: (items: any[]) => any
  setConstructingTree: (state: boolean) => void
}

type TreeNode = Readonly<{
  children: TreeNode[];
  id: number;
  keyCount: number;
  fullName: string;
  name: string;
  keys: any[];
}>

type TreeData = FixedSizeNodeData &
Readonly<{
  isLeaf: boolean;
  name: string;
  keyCount: number;
  fullName: string;
  keys: any[];
  nestingLevel: number;
  setItems: (keys: any[]) => void
}>

type NodeMeta = Readonly<{
  nestingLevel: number;
  node: TreeNode;
}>

let statusOpen:any = {}

const Node = ({
  data: { id, isLeaf, keys, name, keyCount, nestingLevel, fullName, setItems },
  isOpen,
  style,
  setOpen
}: NodePublicState<TreeData>) => {
  const handleClick = () => {
    if (keys) {
      console.log('keys', keys)
      setItems?.(keys)
    }

    statusOpen[fullName] = !isOpen

    !isLeaf && setOpen(!isOpen)
  }

  return (
    <div
      style={{
        ...style,
        paddingLeft: nestingLevel * 30,
      }}
      className={cx(styles.nodeContainer, { [styles.nodeContainerOpen]: isOpen && !isLeaf })}
      onClick={handleClick}
      role="treeitem"
      onKeyDown={() => {}}
      tabIndex={0}
      onFocus={() => {}}
    >
      <div>
        {isLeaf ? 'Keys' : `${(isOpen ? '- ' : '+ ')} ${name}`}
      </div>
      <div>
        {keyCount}
      </div>
    </div>
  )
}

const timeLabel = 'Time for construct a Tree'
const VirtualTree = (props: Props) => {
  const {
    items,
    scrollTopProp = 0,
    onSelectLeaf,
    setConstructingTree,
    separator = ':',
    webworkerFn = () => {}
  } = props

  const dispatch = useDispatch()

  // const [nodes, setNodes] = useState<Node[]>(constructTree(4, 10, 10))
  const [nodes, setNodes] = useState<TreeNode[]>([])

  // const { result, error, run: runWebworker } = useWebworker(webworkerFn)
  const { result, error, run: runWebworker } = useDisposableWebworker(webworkerFn)

  const handleSelectLeaf = useCallback((keys: any[]) => {
    onSelectLeaf?.(keys)
  }, [onSelectLeaf])

  useEffect(() => {
    console.log('webworker result', result)

    if (!result) {
      return
    }
    // dispatch(resetKeysData())

    console.timeEnd(timeLabel)
    setNodes(result)
    setConstructingTree(false)
  }, [result])

  useEffect(() => {
    if (!items?.length) {
      return
    }

    console.time(timeLabel)
    setConstructingTree(true)
    runWebworker({ nodes, items, separator })
  }, [items])

  useEffect(() => {
    statusOpen = {}

    return () => setNodes([])
  }, [])

  const getNodeData = (
    node: TreeNode,
    nestingLevel: number,
  ): TreeWalkerValue<TreeData, NodeMeta> => ({
    data: {
      id: node.id.toString(),
      isLeaf: node.children?.length === 0,
      keyCount: node.keyCount,
      keys: node.keys || node['keys:keys'],
      isOpenByDefault: statusOpen[node.fullName],
      name: node.name,
      fullName: node.fullName,
      nestingLevel,
      setItems: handleSelectLeaf
    },
    nestingLevel,
    node,
  })

  const treeWalker = useCallback(
    function* treeWalker(): ReturnType<TreeWalker<TreeData, NodeMeta>> {
      for (let i = 0; i < nodes.length; i++) {
        yield getNodeData(nodes[i], 0)
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (true) {
        const parentMeta = yield

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < parentMeta.node.children?.length; i++) {
          yield getNodeData(
            parentMeta.node.children[i],
            parentMeta.nestingLevel + 1,
          )
        }
      }
    },
    [nodes],
  )

  return (
    <AutoSizer>
      {({ height, width }) => (
        <>
          { nodes.length > 0 && (
            <Tree
              height={height}
              width={width < 200 ? 200 : width}
              itemSize={20}
              treeWalker={treeWalker}
              className={styles.customScroll}
            >
              {Node}
            </Tree>
          )}
        </>
      )}
    </AutoSizer>
  )
}

// export default React.memo(VirtualTree)
export default VirtualTree
