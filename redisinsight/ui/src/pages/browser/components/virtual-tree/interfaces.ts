import { FixedSizeNodeData } from 'react-vtree'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'

export interface TreeNode {
  children: TreeNode[]
  id: number
  keyCount: number
  keyApproximate: number
  fullName: string
  name: string
  keys: any[]
  [key: string]: any
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
  updateStatusSelected: (fullName: string, keys: any) => void,
  updateStatusOpen: (name: string, value: boolean) => void,
  leafIcon: string,
  keyApproximate: number,
  isSelected: boolean,
  isOpenByDefault: boolean,
}

export interface TreeData extends FixedSizeNodeData {
  isLeaf: boolean
  name: string
  nameString: string
  nameBuffer: RedisResponseBuffer
  path: string
  keyCount: number
  keyApproximate: number
  fullName: string
  shortName?: string
  leafIcon: string
  type: KeyTypes | ModulesKeyTypes
  ttl: number
  size: number
  nestingLevel: number
  deleting: boolean
  isSelected: boolean
  delimiters: string[]
  children?: TreeData[]
  updateStatusOpen: (fullName: string, value: boolean) => void
  updateStatusSelected: (key: RedisString) => void
  getMetadata: (key: RedisString, path: string) => void
  onDelete: (key: RedisResponseBuffer) => void
  onDeleteClicked: (type: KeyTypes | ModulesKeyTypes) => void
}
