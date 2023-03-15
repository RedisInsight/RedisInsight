import { TreeNode } from 'uiSrc/components/virtual-tree'
import { Nullable } from './types'

export const getTreeLeafField = (delimiter = '') => `keys${delimiter}keys`

export const findTreeNode = (
  data: TreeNode[],
  value: string,
  key = 'id',
  tempObj: { found?: TreeNode } = {},
): Nullable<TreeNode> => {
  if (value && data) {
    // eslint-disable-next-line sonarjs/no-ignored-return
    data.find((node) => {
      if (node[key] === value) {
        tempObj.found = node
        return node
      }
      return findTreeNode(node.children, value, key, tempObj)
    })
    if (tempObj.found) {
      return tempObj.found
    }
  }
  return null
}
