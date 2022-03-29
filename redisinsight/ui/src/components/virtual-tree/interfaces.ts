import { FixedSizeNodeData } from 'react-vtree'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'

export const TREE_LEAF_FIELD = 'keys:keys'

export interface TreeNode {
  children: TreeNode[]
  id: number
  keyCount: number
  keyApproximate: number
  fullName: string
  name: string
  keys: any[]
  [TREE_LEAF_FIELD]?: any
}

export interface NodeMeta {
  nestingLevel: number;
  node: TreeNode;
  data: NodeMetaData
}

export interface NodeMetaData {
  id: string,
  isLeaf: boolean,
  keyCount: number,
  name: string,
  fullName: string,
  setItems: (keys: any[]) => void,
  updateStatusSelected: (fullName: string, keys: any) => void,
  updateStatusOpen: (name: string, value: boolean) => void,
  leafIcon: string,
  keyApproximate: number,
  keys: any,
  isSelected: boolean,
  isOpenByDefault: boolean,
}

export interface TreeData extends FixedSizeNodeData {
  isLeaf: boolean
  name: string
  keyCount: number
  keyApproximate: number
  fullName: string
  leafIcon: string
  keys: IKeyPropTypes[]
  nestingLevel: number
  isSelected: boolean
  setItems: (keys: any[]) => void
  updateStatusOpen: (fullName: string, value: boolean) => void
  updateStatusSelected: (fullName: string, keys: IKeyPropTypes[]) => void
}
